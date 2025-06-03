import { Practice } from '../models/Practice';
import type { User } from '../models/userModel';
import { AppDataSource } from '../config/typeorm';

export class PracticeService {
    private practiceRepository = AppDataSource.getRepository(Practice);
    private userRepository = AppDataSource.getRepository('User');

    async create(practiceData: Partial<Practice>): Promise<Practice> {
        const practice = this.practiceRepository.create(practiceData);
        return await this.practiceRepository.save(practice);
    }

    async findAll(): Promise<Practice[]> {
        return await this.practiceRepository.find({
            relations: ['clientGroups']
        });
    }

    async findById(id: string): Promise<Practice | null> {
        return await this.practiceRepository.findOne({ 
            where: { id },
            relations: ['clientGroups']
        });
    }

    async update(id: string, practiceData: Partial<Practice>): Promise<Practice | null> {
        await this.practiceRepository.update(id, practiceData);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.practiceRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    // Helper method to populate staff data
    private async populateStaffData(practice: Practice): Promise<Practice> {
        // Helper function to safely cast user data
        const safeUserCast = (userData: any): User | undefined => {
            if (!userData) return undefined;
            return {
                id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                level: userData.level,
                active: userData.active,
                created_at: userData.created_at,
                updated_at: userData.updated_at
            };
        };

        // Populate single staff members
        if (practice.staffPartnerId) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffPartnerId } });
            practice.staffPartner = safeUserCast(userData);
        }
        if (practice.staffManager1Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffManager1Id } });
            practice.staffManager1 = safeUserCast(userData);
        }
        if (practice.staffManager2Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffManager2Id } });
            practice.staffManager2 = safeUserCast(userData);
        }
        if (practice.staffBookkeeper1Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffBookkeeper1Id } });
            practice.staffBookkeeper1 = safeUserCast(userData);
        }
        if (practice.staffBookkeeper2Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffBookkeeper2Id } });
            practice.staffBookkeeper2 = safeUserCast(userData);
        }
        if (practice.staffTaxSpecialistId) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffTaxSpecialistId } });
            practice.staffTaxSpecialist = safeUserCast(userData);
        }
        if (practice.staffOther1Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffOther1Id } });
            practice.staffOther1 = safeUserCast(userData);
        }
        if (practice.staffOther2Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffOther2Id } });
            practice.staffOther2 = safeUserCast(userData);
        }
        if (practice.staffOther3Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffOther3Id } });
            practice.staffOther3 = safeUserCast(userData);
        }
        if (practice.staffOther4Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffOther4Id } });
            practice.staffOther4 = safeUserCast(userData);
        }
        if (practice.staffOther5Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffOther5Id } });
            practice.staffOther5 = safeUserCast(userData);
        }
        if (practice.staffAdmin1Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffAdmin1Id } });
            practice.staffAdmin1 = safeUserCast(userData);
        }
        if (practice.staffAdmin2Id) {
            const userData = await this.userRepository.findOne({ where: { id: practice.staffAdmin2Id } });
            practice.staffAdmin2 = safeUserCast(userData);
        }

        // Populate accountants array
        if (practice.staffAccountantIds?.length) {
            const userDataArray = await this.userRepository.findByIds(practice.staffAccountantIds);
            practice.staffAccountants = userDataArray.map(safeUserCast).filter((u): u is User => u !== undefined);
        }

        return practice;
    }

    // Methods with populated staff data
    async findAllWithStaff(): Promise<Practice[]> {
        return await this.practiceRepository.find({
            relations: ['clientGroups']
        });
    }

    async findByIdWithStaff(id: string): Promise<Practice | null> {
        return await this.practiceRepository.findOne({
            where: { id },
            relations: ['clientGroups']
        });
    }
} 