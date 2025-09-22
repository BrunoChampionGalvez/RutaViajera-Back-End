import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./rooms.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "./rooms.dtos";
import { RoomsType } from "src/roomstype/roomstype.entity";
import { generateUniqueRandomNumbers } from "src/utils/generateRandonNumbers";
import { LoadRoomsDto } from "./rooms.loadDtos";
import { UpdateRoomDto } from "./rooms.updateDto";


@Injectable()
export class RoomsRepository{
    constructor(
        @InjectRepository(Room) private readonly roomDbRepository: Repository<Room>,
        @InjectRepository(RoomsType) private readonly roomstypeDbRepository: Repository<RoomsType>
    ){}

    async getDbRooms(): Promise<Room[]> {
        let roomsList: Room[] = await this.roomDbRepository.find();
        if(roomsList.length !==0){
            roomsList = roomsList.filter((room)=> room.isDeleted === false);
            return roomsList;
        }
        else throw new NotFoundException("there are not rooms");
    }
    
    async getDbRoomById(id:string): Promise<Room>{
        const roomById: Room = await this.roomDbRepository.findOne({where:{id}});
        if(!roomById || roomById.isDeleted === true ) throw new NotFoundException("this room is not available");
        else return roomById;
    }

    async createDbRoom(roomDto: CreateRoomDto):Promise<Room> {
        const { roomsTypeId, roomNumber } = roomDto;
        // const roomFound = await this.roomDbRepository.findOne({where:{roomNumber}});
        // if(roomFound) throw new BadRequestException("this room exists");
        const roomtypeFound: RoomsType = await this.roomstypeDbRepository.findOne({
            where:{id:roomsTypeId},
            relations: ['hotel']
        });
        console.log('RoomType Found:', roomtypeFound);

        if(!roomtypeFound){
            throw new NotFoundException("Roomtype with ID not found");
        } 
        // Unicidad solo dentro del mismo room type (no a nivel de hotel completo)
        // Look for existing (including soft-deleted) room with same number inside this room type
        const roomFound = await this.roomDbRepository.createQueryBuilder('room')
            .innerJoin('room.roomtype', 'rt')
            .where('room.roomNumber = :roomNumber', { roomNumber })
            .andWhere('rt.id = :rtId', { rtId: roomtypeFound.id })
            .getOne();
        if (roomFound) {
            if (roomFound.isDeleted) {
                // Restore soft deleted room
                roomFound.isDeleted = false;
                await this.roomDbRepository.save(roomFound);
                return await this.roomDbRepository.findOne({
                    where:{id:roomFound.id},
                    relations: ['roomtype', 'roomtype.hotel']
                });
            }
            throw new BadRequestException('this room number already exists in this room type');
        }
        
        const newRoom = this.roomDbRepository.create({
            roomNumber,
            roomtype: roomtypeFound,
        });

        await this.roomDbRepository.save(newRoom);

        const saveRoom = await this.roomDbRepository.findOne({
            where:{id:newRoom.id},
            relations: ['roomtype', 'roomtype.hotel']
        });
        if(!saveRoom) throw new NotFoundException("Room not found after creation"); 

        return saveRoom;
        
    }    

    async loadRooms(loadroomDto: LoadRoomsDto): Promise<string> {
        const { nIni, nEnd, quantity, roomsTypeId } = loadroomDto;
        const roomtypeFound: RoomsType = await this.roomstypeDbRepository.findOne({ where: {id: roomsTypeId } });

        if (!roomtypeFound) {
            throw new NotFoundException("RoomType with ID not found");
        }

        const roomNumbers = generateUniqueRandomNumbers(nIni, nEnd, quantity);
        const createdRoomIds: string[] = [];
        console.log( roomNumbers);
        
        roomNumbers?.map(async (ele) =>{
            const newRoom = new Room();
            newRoom.roomtype = roomtypeFound;
            newRoom.roomNumber = ele.toString();
            
            await this.roomDbRepository
                .createQueryBuilder()
                .insert()
                .into(Room)
                .values(newRoom)
                // .orUpdate(
                //     ['roomNumber'] 
                // )
                .execute();
        
        });

        return "rooms reload";
    }

    async updateDbRoom(id: string, updateroomDto: Partial<UpdateRoomDto>): Promise<string>{
        const roomFound: Room = await this.roomDbRepository.findOne({where: {id}});
        if(!roomFound) throw new NotFoundException("this room does not exists");

        await this.roomDbRepository.update({ id }, {...updateroomDto});

        return id;
    }

    async deleteDbRoom(id: string): Promise<Room>{
        const roomFound: Room = await this.roomDbRepository.findOne({where:{id}, relations: ['roomtype']});
        
        if(!roomFound) throw new NotFoundException("Room not found");
        if(roomFound.isDeleted === true) throw new BadRequestException("Room was eliminated");
        await this.roomDbRepository.update({id}, {isDeleted:true});
        return this.roomDbRepository.findOne({
            where: { id },
            relations: ['roomtype']
        });
    }

    async restoreDbRoom(id: string): Promise<Room>{
        const roomFound: Room = await this.roomDbRepository.findOne({where:{id}, relations: ['roomtype']});
        if(!roomFound) throw new NotFoundException("Room not found");
        if(roomFound.isDeleted === false) throw new BadRequestException("Room is active");

        await this.roomDbRepository.update(id, {isDeleted:false});

        return this.roomDbRepository.findOne({
            where: { id },
            relations: ['roomtype']
        });
    }

    async getDbRoomDeleted(): Promise<Room[]>{
        const listRoom: Room[] = await this.roomDbRepository.find({where: {isDeleted:true}});
        if(listRoom.length !==0){
            return listRoom;
        }
        else throw new NotFoundException("there are not rooms eliminated");
    }

    async getRoomsByRoomTypeId(id: string): Promise<Room[]> {
        const rooms = await this.roomDbRepository.find({ where: { isDeleted: false, roomtype: { id: id }, } })
        if (rooms.length === 0) throw new NotFoundException('Ese room type no tiene cuartos.')
        return rooms
    }

    async searchRoom(roomTypeId: string, query?: string): Promise<Room[]> {
        const queryBuilder = this.roomDbRepository
            .createQueryBuilder('room')
            .where('room.roomtype.id = :roomTypeId', { roomTypeId });

        if (query) {
            console.log('buscando room ...');
            const searchTerm = `%${query.toLowerCase()}%`;

            queryBuilder
                .andWhere('room.isDeleted = false')
                .andWhere('unaccent(LOWER(room.roomNumber)) ILIKE unaccent(:searchTerm)', { searchTerm })
        }

        return await queryBuilder.getMany();
    }
}
