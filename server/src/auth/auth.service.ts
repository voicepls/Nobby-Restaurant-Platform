import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  /**
   * Seed default Admin account on initial boot if no admin user exists
   */
  private async seedDefaultAdmin() {
    try {
      const adminExists = await this.userRepository.findOne({
        where: { role: Role.ADMIN },
      });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = this.userRepository.create({
          email: 'admin@nobby.com',
          name: 'Nobby Admin',
          password: hashedPassword,
          role: Role.ADMIN,
          isActive: true,
        });

        await this.userRepository.save(adminUser);
        this.logger.log('🔑 Default Admin account seeded successfully: admin@nobby.com / admin123');
      }
    } catch (error) {
      this.logger.warn('Could not check/seed default admin (database may not be connected yet)');
    }
  }

  /**
   * Register a new user (Staff or Customer, Admin can also create accounts)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      email: registerDto.email.toLowerCase().trim(),
      name: registerDto.name.trim(),
      password: hashedPassword,
      role: registerDto.role || Role.STAFF,
    });

    const savedUser = await this.userRepository.save(newUser);

    const token = this.generateJwtToken(savedUser);

    return {
      access_token: token,
      user: this.sanitizeUser(savedUser),
    };
  }

  /**
   * Authenticate user credentials and return JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const email = loginDto.email.toLowerCase().trim();

    // Explicitly select password field which has select: false on Entity
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateJwtToken(user);

    return {
      access_token: token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * List all users (Admin only)
   */
  async findAllUsers(): Promise<UserProfileDto[]> {
    const users = await this.userRepository.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => this.sanitizeUser(user));
  }

  /**
   * Generate JWT token for user
   */
  private generateJwtToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Remove sensitive fields from UserEntity
   */
  private sanitizeUser(user: UserEntity): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
