import bcrypt from 'bcrypt';
import { User } from '../../models/User';
import { UserService } from '../../services/UserService';

export async function seedDefaultUsers(userService: UserService): Promise<void> {
  const saltRounds = 10;

  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@dkbs.com',
      password: await bcrypt.hash('admin123', saltRounds),
      role: 'Admin'
    },
    {
      name: 'Editor User',
      email: 'editor@dkbs.com',
      password: await bcrypt.hash('editor123', saltRounds),
      role: 'Editor'
    },
    {
      name: 'Viewer User',
      email: 'viewer@dkbs.com',
      password: await bcrypt.hash('viewer123', saltRounds),
      role: 'Viewer'
    }
  ];

  for (const userData of defaultUsers) {
    const existingUser = await userService.findByEmail(userData.email);
    if (!existingUser) {
      await userService.create(userData as User);
      console.log(`Created default ${userData.role} user`);
    }
  }
}