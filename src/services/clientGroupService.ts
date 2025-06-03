import { AppDataSource } from '../config/typeorm';
import { ClientGroup } from '../models/ClientGroup';

export class ClientGroupService {
    private clientGroupRepository = AppDataSource.getRepository(ClientGroup);

    async create(data: Partial<ClientGroup>): Promise<ClientGroup> {
        const clientGroup = this.clientGroupRepository.create(data);
        return await this.clientGroupRepository.save(clientGroup);
    }

    async findAll(practiceId?: string): Promise<ClientGroup[]> {
        const query = this.clientGroupRepository.createQueryBuilder('clientGroup')
            .leftJoinAndSelect('clientGroup.practice', 'practice');

        if (practiceId) {
            query.where('clientGroup.practiceId = :practiceId', { practiceId });
        }

        return await query.getMany();
    }

    async findById(id: string): Promise<ClientGroup | null> {
        return await this.clientGroupRepository.findOne({
            where: { id },
            relations: ['practice']
        });
    }

    async update(id: string, data: Partial<ClientGroup>): Promise<ClientGroup | null> {
        await this.clientGroupRepository.update(id, data);
        return await this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.clientGroupRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async findByPracticeId(practiceId: string): Promise<ClientGroup[]> {
        return await this.clientGroupRepository.find({
            where: { practice_id: practiceId },
            relations: ['practice']
        });
    }
} 