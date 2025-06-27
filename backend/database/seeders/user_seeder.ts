import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Criar usuário administrador inicial
    await User.firstOrCreate(
      { email: 'admin@clinicaessencial.com' },
      {
        name: 'Administrador',
        email: 'admin@clinicaessencial.com',
        password: 'admin123',
        role: 'admin',
        active: true,
      }
    )

    // Criar usuário recepcionista de exemplo
    await User.firstOrCreate(
      { email: 'recepcao@clinicaessencial.com' },
      {
        name: 'Recepcionista',
        email: 'recepcao@clinicaessencial.com',
        password: 'recepcao123',
        role: 'recepcionista',
        active: true,
      }
    )
  }
}