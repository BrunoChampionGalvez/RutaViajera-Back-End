import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { BookingDetails } from 'src/bookingDetails/booking-detail.entity';
import { RoomsType } from 'src/roomstype/roomstype.entity';
import { RoomAvailability } from 'src/availabilities/availability.entity';
import { Hotel } from 'src/hotels/hotels.entity';
import { Room } from 'src/rooms/rooms.entity';
import { BookingDetailsStatus } from 'src/bookingDetails/enum/booking-detail-status.enum';
import { PostponeBookingDto } from './dtos/postpone-booking.dto';
import { Customers } from 'src/customers/customers.entity';
import { HotelAdmins } from 'src/hotel-admins/hotelAdmins.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingDBRepository: Repository<Booking>,
    @InjectRepository(BookingDetails)
    private readonly bookingDetailsDBRepository: Repository<BookingDetails>,
    @InjectRepository(Customers)
    private readonly customersDBRepository: Repository<Customers>,
    @InjectRepository(RoomsType)
    private readonly roomTypeDBRepository: Repository<RoomsType>,
    @InjectRepository(RoomAvailability)
    private readonly roomAvailabilityDBRepository: Repository<RoomAvailability>,
    @InjectRepository(Hotel)
    private readonly hotelDBRepository: Repository<Hotel>,
    @InjectRepository(Room) private readonly roomDBRepository: Repository<Room>,
    @InjectRepository(HotelAdmins)
    private readonly hotelAdminDBRepository: Repository<HotelAdmins>,
  ) {}

  async getBookings() {
    const bookings = await this.bookingDBRepository.find({
      where: { isDeleted: false },
      relations: {
        bookingDetails: {
          hotel: true,
          availabilities: { room: { roomtype: true } },
        },
        customer: true,
      },
      select: {
        customer: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          password: false,
          phone: true,
          country: true,
          city: true,
          address: true,
          birthDate: true,
        },
      },
    });

    if (bookings.length === 0)
      throw new NotFoundException('No se encontró ningún booking.');
    for (const b of bookings) {
      try {
        if (!b?.bookingDetails?.availabilities?.length) continue;
        let recalculated = 0;
        for (const av of b.bookingDetails.availabilities) {
          const price = (av as any)?.room?.roomtype?.price || 0;
          const start = new Date(av.startDate).getTime();
          const end = new Date(av.endDate).getTime();
          if (!start || !end) continue;
          const nights = Math.max(1, Math.ceil((end - start)/(1000*60*60*24)));
          recalculated += price * nights;
        }
        if (recalculated > b.bookingDetails.total && Math.abs(recalculated - b.bookingDetails.total) >= 1) {
          (b.bookingDetails as any).total = recalculated;
        }
      } catch { }
    }
    return bookings;
  }

  async getIsDeletedBookings() {
    const bookings = await this.bookingDBRepository.find({
      where: { isDeleted: true },
      relations: {
        bookingDetails: {
          hotel: true,
          availabilities: { room: { roomtype: true } },
        },
        customer: true,
      },
      select: {
        customer: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          password: false,
          phone: true,
          country: true,
          city: true,
          address: true,
          birthDate: true,
        },
      },
    });
    return bookings;
  }
  async getBookingById(id: string) {
    const booking = await this.bookingDBRepository.findOne({
      where: { id: id },
      relations: {
        bookingDetails: {
          availabilities: { room: { roomtype: true } },
          hotel: true,
        },
        customer: true,
      },
      select: {
        customer: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          password: false,
          phone: true,
          country: true,
          city: true,
          address: true,
          birthDate: true,
        },
      },
    });
    if (!booking)
      throw new NotFoundException('No se encontró un booking con ese id.');

    if (booking?.bookingDetails?.availabilities?.length) {
      try {
        let recalculated = 0;
        for (const av of booking.bookingDetails.availabilities) {
          const price = (av as any)?.room?.roomtype?.price || 0;
          const start = new Date(av.startDate).getTime();
          const end = new Date(av.endDate).getTime();
          if (!start || !end) continue;
          const nights = Math.max(1, Math.ceil((end - start)/(1000*60*60*24)));
          recalculated += price * nights;
        }
        if (recalculated > booking.bookingDetails.total && Math.abs(recalculated - booking.bookingDetails.total) >= 1) {
          (booking.bookingDetails as any).total = recalculated;
        }
      } catch { }
    }
    return booking;
  }

  async getBookingsByCustomerId(id: string) {
    const customer = await this.customersDBRepository.findOneBy({ id });
    if (!customer || customer.isDeleted)
      throw new NotFoundException('Customer con id enviado no encontrado.');
    const bookings = await this.bookingDBRepository.find({
      where: { isDeleted: false, customer: { id: id } },
      relations: {
        bookingDetails: {
          availabilities: { room: { roomtype: true } },
          hotel: true,
        },
        customer: true,
      },
      select: {
        customer: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          password: false,
          phone: true,
          country: true,
          city: true,
          address: true,
          birthDate: true,
        },
      },
    });

    if (bookings.length === 0)
      throw new BadRequestException('No se encontró ningún booking.');
    // Backward compatibility: si algún booking antiguo tiene total sin multiplicar noches, recalcular en memoria.
    for (const b of bookings) {
      try {
        if (!b?.bookingDetails?.availabilities?.length) continue;
        let recalculated = 0;
        for (const av of b.bookingDetails.availabilities) {
          const rtPrice = (av as any)?.room?.roomtype?.price || 0;
          const start = new Date(av.startDate).getTime();
          const end = new Date(av.endDate).getTime();
          if (!start || !end) continue;
          const nights = Math.max(1, Math.ceil((end - start)/(1000*60*60*24)));
          recalculated += rtPrice * nights;
        }
        // Si recalculado es mayor y la diferencia >= 1 asumimos legacy y sustituimos para la respuesta.
        if (recalculated > b.bookingDetails.total && Math.abs(recalculated - b.bookingDetails.total) >= 1) {
          (b.bookingDetails as any).total = recalculated;
        }
      } catch { /* ignore individual errors */ }
    }
    return bookings;
  }

  async getBookingsByHotelAdminId(id: string) {
    const hotelAdmin = await this.hotelAdminDBRepository.findOneBy({ id });
    if (!hotelAdmin || hotelAdmin.isDeleted)
      throw new NotFoundException('Hotel admin con id enviado no encontrado.');

    const bookings = await this.bookingDBRepository.find({
      where: {
        isDeleted: false,
        bookingDetails: { hotel: { hotelAdmin: { id: id } } },
      },
      relations: {
        bookingDetails: {
          availabilities: { room: { roomtype: true } },
          hotel: true,
        },
        customer: true,
      },
      select: {
        customer: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          password: false,
          phone: true,
          country: true,
          city: true,
          address: true,
          birthDate: true,
        },
      },
    });

    if (bookings.length === 0)
      throw new BadRequestException('No se encontró ningún booking.');
    // Retroactive nights * price recalculation for legacy totals (admin scope)
    for (const b of bookings) {
      try {
        if (!b?.bookingDetails?.availabilities?.length) continue;
        let recalculated = 0;
        for (const av of b.bookingDetails.availabilities) {
          const price = (av as any)?.room?.roomtype?.price || 0;
          const start = new Date(av.startDate).getTime();
          const end = new Date(av.endDate).getTime();
          if (!start || !end) continue;
          const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
          recalculated += price * nights;
        }
        if (recalculated > b.bookingDetails.total && Math.abs(recalculated - b.bookingDetails.total) >= 1) {
          (b.bookingDetails as any).total = recalculated;
        }
      } catch { /* ignore individual */ }
    }
    return bookings;
  }

async getBookingsAndItsCustomerByHotelId(id: string) {
  const bookings = await this.bookingDBRepository.find({
    where: { bookingDetails: { hotel: { id: id } } },
    relations: {
      customer: true,
      bookingDetails: { availabilities: { room: { roomtype: true } } },
    },
  });
  if (bookings.length === 0) throw new NotFoundException('No se encontraron bookings de ese hotel.');
  // Retroactive recalculation for per-hotel listing (used in hotel dashboards)
  for (const b of bookings) {
    try {
      if (!b?.bookingDetails?.availabilities?.length) continue;
      let recalculated = 0;
      for (const av of b.bookingDetails.availabilities) {
        const price = (av as any)?.room?.roomtype?.price || 0;
        const start = new Date(av.startDate).getTime();
        const end = new Date(av.endDate).getTime();
        if (!start || !end) continue;
        const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        recalculated += price * nights;
      }
      if (recalculated > b.bookingDetails.total && Math.abs(recalculated - b.bookingDetails.total) >= 1) {
        (b.bookingDetails as any).total = recalculated;
      }
    } catch { /* ignore individual */ }
  }
  return bookings;
}

  async createBooking(bookingData: CreateBookingDto) {
    const { customerId, hotelId, roomTypesIdsAndDates } = bookingData;
    const now = new Date().toISOString();
    const { password, ...customer } = await this.customersDBRepository.findOne({
      where: { id: customerId },
    });

    if (!customer || customer.isDeleted)
      throw new NotFoundException('Customer no encontrado.');

  // Total acumulado de la reserva. Actualmente el front espera price * nights * cantidad.
  let total: number = 0;
    const availabilitiesCreated = [];
    let numberOfAvailabilitiesToSave = roomTypesIdsAndDates.length;
    let numberOfAvailabilitiesCreated = 0;

    const hotel = await this.hotelDBRepository.findOne({
      where: { id: hotelId },
      relations: { roomstype: { rooms: { availabilities: true } } },
    });

    const hotelToBook = hotel;

    if (!hotelToBook || hotelToBook.isDeleted)
      throw new NotFoundException('Hotel no encontrado.');

    for (const roomTypeIdAndDate of roomTypesIdsAndDates) {
      let atLeastOneRoomTypeIdMatches = false;
      const { roomTypeId, checkInDate, checkOutDate } = roomTypeIdAndDate;
      const customerCheckInDate = new Date(checkInDate).getTime();
      const customerCheckOutDate = new Date(checkOutDate).getTime();
      if (customerCheckOutDate < customerCheckInDate)
        throw new BadRequestException(
          'Los checkInDates deben ser anteriores en el tiempo a sus respectivos checkOutDates.',
        );
      let isBooked = false;

      for (const roomTypeOfHotel of hotelToBook.roomstype) {
        if (isBooked) break;
        if (roomTypeOfHotel.isDeleted) continue;
        if (roomTypeId !== roomTypeOfHotel.id) continue;
        atLeastOneRoomTypeIdMatches = true;
        for (const room of roomTypeOfHotel.rooms) {
          if (isBooked) {
            break;
          }
          if (room.isDeleted) continue;
          let isAvailable = true;
          for (const availability of room.availabilities) {
            if (availability.isDeleted) continue;
            const availabilityStartDate = new Date(
              availability.startDate,
            ).getTime();
            const availabilityEndDate = new Date(
              availability.endDate,
            ).getTime();

            if (
              !(
                customerCheckOutDate <= availabilityStartDate ||
                customerCheckInDate >= availabilityEndDate
              )
            ) {
              if (availability.isAvailable || availability.isDeleted) continue;
              isAvailable = false;
              break;
            }
          }

          if (isAvailable) {
            const { availabilities, ...newRoom } = room;
            const newRoomType = await this.roomTypeDBRepository.findOneBy({
              id: roomTypeId,
            });
            newRoom.roomtype = newRoomType;
            const newAvailability = this.roomAvailabilityDBRepository.create({
              startDate: checkInDate,
              endDate: checkOutDate,
              room: newRoom,
            });

            const createdAvailability =
              this.roomAvailabilityDBRepository.create(newAvailability);
            numberOfAvailabilitiesCreated += 1;
            availabilitiesCreated.push(createdAvailability);
            room.availabilities.push(createdAvailability);
            // Calcular noches (mínimo 1)
            const nights = Math.max(1, Math.ceil((customerCheckOutDate - customerCheckInDate)/(1000*60*60*24)));
            // Sumamos price * nights. (Si el cliente envía el mismo roomTypeId varias veces en roomTypesIdsAndDates, cada iteración representará una unidad adicional.)
            total += roomTypeOfHotel.price * nights;
            // Debug informativo
            // console.log('[BookingTotalDebug] roomType', roomTypeId, 'price', roomTypeOfHotel.price, 'nights', nights, 'partialTotal', total);
            isBooked = true;
            break;
          }
        }
        if (isBooked) break;
      }

      if (!atLeastOneRoomTypeIdMatches)
        throw new BadRequestException(
          'El roomTypeId enviado no coincide con ningún id de los roomtypes del hotel con el hotelId enviado.',
        );

      if (!isBooked) {
        console.log('[BookingDebug] No room booked for roomTypeId', roomTypeId, 'dates', checkInDate, checkOutDate);
        // Optional: detail each room availability overlap
        for (const rt of hotelToBook.roomstype) {
          if (rt.id !== roomTypeId) continue;
          for (const room of rt.rooms) {
            const overlaps = room.availabilities?.filter(a => {
              const aStart = new Date(a.startDate).getTime();
              const aEnd = new Date(a.endDate).getTime();
              return !(customerCheckOutDate <= aStart || customerCheckInDate >= aEnd);
            }).map(a => ({id: a.id, start: a.startDate, end: a.endDate, isAvailable: a.isAvailable, isDeleted: a.isDeleted}));
            console.log('[BookingDebug] Room', room.id, 'overlaps:', overlaps);
          }
        }
        throw new BadRequestException(
          'No available rooms for the specified dates.',
        );
      }
    }
    const availabilitiesSaved = [];
    console.log(availabilitiesCreated);

    if (
      numberOfAvailabilitiesCreated === numberOfAvailabilitiesToSave &&
      availabilitiesCreated.length > 0
    ) {
      for (const availability of availabilitiesCreated) {
        const savedAvailability =
          await this.roomAvailabilityDBRepository.save(availability);
        availabilitiesSaved.push(savedAvailability);
      }
      const { roomstype, ...newHotel } = hotelToBook;
      const bookingDetails = this.bookingDetailsDBRepository.create({
        total,
        hotel: newHotel,
        availabilities: availabilitiesSaved,
      });
      const newBookingDetails =
        await this.bookingDetailsDBRepository.save(bookingDetails);
      const booking = this.bookingDBRepository.create({
        date: now,
        bookingDetails: newBookingDetails,
        customer,
      });
      const newBooking = await this.bookingDBRepository.save(booking);
      return newBooking;
    } else {
      throw new BadRequestException(
        'No hay fechas libres para las fechas solicitadas.',
      );
    }
  }

  async cancelBooking(id: string) {
    const booking = await this.bookingDBRepository.findOne({
      where: { id: id },
      relations: { bookingDetails: { availabilities: true } },
    });
    if (!booking) throw new NotFoundException('Booking no encontrado.');
    for (const availability of booking.bookingDetails.availabilities) {
      await this.roomAvailabilityDBRepository.update(
        { id: availability.id },
        { isAvailable: true },
      );
    }
    await this.bookingDetailsDBRepository.update(
      { id: booking.bookingDetails.id },
      { status: BookingDetailsStatus.CANCELLED },
    );

    return 'Booking cancelado exitosamente.';
  }

  async postponeBooking(bookingData: PostponeBookingDto) {
    // 2024-07-25T17:04:51.143Z
    const { bookingId, newAvailabilities } = bookingData;
    const booking = await this.bookingDBRepository.findOne({
      where: { id: bookingId },
      relations: {
        bookingDetails: {
          hotel: { roomstype: { rooms: { availabilities: true } } },
        },
      },
    });
    if (!booking || booking.isDeleted)
      throw new NotFoundException('No se encontró un booking con ese id.');
    const availabilitiesCreated = [];
  // Recalcular total con misma lógica (price * nights) usada en createBooking
  let total: number = 0;
    let numberOfAvailabilitiesToSave = newAvailabilities.length;
    let numberOfAvailabilitiesCreated = 0;

    for (const newAvailability of newAvailabilities) {
      let atLeastOneRoomTypeIdMatches = false;
      const newAvailabilityWithId =
        await this.roomAvailabilityDBRepository.findOne({
          where: { id: newAvailability.id },
          relations: { room: { roomtype: true } },
        });
      if (!newAvailabilityWithId || newAvailabilityWithId.isDeleted)
        throw new NotFoundException(
          `No se encontró un availability con id ${newAvailabilityWithId.id}`,
        );
      const customerCheckInDate = new Date(newAvailability.startDate).getTime();
      const customerCheckOutDate = new Date(newAvailability.endDate).getTime();
      if (customerCheckOutDate < customerCheckInDate)
        throw new BadRequestException(
          'Los checkInDates deben ser anteriores en el tiempo a sus respectivos checkOutDates.',
        );
      let isBooked = false;
      for (const roomType of booking.bookingDetails.hotel.roomstype) {
        if (isBooked) break;
        if (roomType.isDeleted) continue;
        if (roomType.id !== newAvailabilityWithId.room.roomtype.id) continue;
        atLeastOneRoomTypeIdMatches = true;
        for (const room of roomType.rooms) {
          if (isBooked) break;
          if (room.isDeleted) continue;
          let isAvailable = true;

          for (const oldAvailability of room.availabilities) {
            if (isBooked) break;
            if (oldAvailability.isDeleted) continue;
            const oldAvailabilityStartDate = new Date(
              oldAvailability.startDate,
            ).getTime();
            const oldAvailabilityEndDate = new Date(
              oldAvailability.endDate,
            ).getTime();

            if (
              !(
                customerCheckOutDate <= oldAvailabilityStartDate ||
                customerCheckInDate >= oldAvailabilityEndDate
              )
            ) {
              if (oldAvailability.isAvailable || oldAvailability.isDeleted)
                continue;
              if (oldAvailability.id === newAvailability.id) continue;
              isAvailable = false;
              break;
            }
          }
          if (isAvailable) {
            const { availabilities, ...newRoom } = room;
            const newRoomType = await this.roomTypeDBRepository.findOneBy({
              id: roomType.id,
            });

            newRoom.roomtype = newRoomType;
            const createdAvailability =
              this.roomAvailabilityDBRepository.create({
                id: newAvailability.id,
                startDate: newAvailability.startDate,
                endDate: newAvailability.endDate,
                room: newRoom,
                isAvailable: false,
              });
            numberOfAvailabilitiesCreated += 1;
            availabilitiesCreated.push(createdAvailability);
            room.availabilities.push(createdAvailability);
            const nights = Math.max(1, Math.ceil((customerCheckOutDate - customerCheckInDate)/(1000*60*60*24)));
            total += roomType.price * nights;
            isBooked = true;
            break;
          }
        }
        if (isBooked) break;
      }

      if (!atLeastOneRoomTypeIdMatches)
        throw new BadRequestException(
          'El roomTypeId enviado no coincide con ningún id de los roomtypes del hotel con el hotelId enviado.',
        );

      if (!isBooked) {
        throw new BadRequestException(
          'No available rooms for the specified dates.',
        );
      }
    }
    if (
      numberOfAvailabilitiesCreated === numberOfAvailabilitiesToSave &&
      availabilitiesCreated.length > 0
    ) {
      for (const availability of availabilitiesCreated) {
        await this.roomAvailabilityDBRepository.save(availability);
      }
      // Persist newly recalculated total (legacy code previously omitted the update)
      try {
        await this.bookingDetailsDBRepository.update(
          { id: booking.bookingDetails.id },
          { total }
        );
      } catch { /* swallow update error to not block response */ }
      const newBooking = await this.bookingDBRepository.findOne({
        where: { id: booking.id },
        relations: {
          bookingDetails: {
            availabilities: { room: { roomtype: true } },
            hotel: true,
          },
          customer: true,
        },
        select: {
          customer: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            password: false,
            phone: true,
            country: true,
            city: true,
            address: true,
            birthDate: true,
          },
        },
      });
      // Safety: adjust in-memory if legacy total still smaller after update (e.g., race or rounding)
      try {
        if (newBooking?.bookingDetails?.availabilities?.length) {
          let recalculated = 0;
          for (const av of newBooking.bookingDetails.availabilities) {
            const price = (av as any)?.room?.roomtype?.price || 0;
            const start = new Date(av.startDate).getTime();
            const end = new Date(av.endDate).getTime();
            if (!start || !end) continue;
            const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            recalculated += price * nights;
          }
          if (recalculated > (newBooking as any).bookingDetails.total && Math.abs(recalculated - (newBooking as any).bookingDetails.total) >= 1) {
            (newBooking as any).bookingDetails.total = recalculated;
          }
        }
      } catch { /* ignore */ }

      return {
        message: 'Booking con availabilities actualizadas.',
        newBooking,
      };
    } else {
      throw new BadRequestException(
        'No hay fechas libres para las fechas solicitadas.',
      );
    }
  }

  async deleteBooking(id: string) {
    const booking = await this.bookingDBRepository.findOne({
      where: { id },
      relations: { bookingDetails: { availabilities: true } },
    });
    for (const availability of booking.bookingDetails.availabilities) {
      await this.roomAvailabilityDBRepository.delete({ id: availability.id });
    }
    await this.bookingDBRepository.delete({ id });
    await this.bookingDetailsDBRepository.delete({
      id: booking.bookingDetails.id,
    });
    return 'El booking, su bookingDetails y sus availabilities han sido eliminados.';
  }

  async softDeleteBooking(id: string) {
    const booking = await this.bookingDBRepository.findOne({
      where: { id },
      relations: { bookingDetails: { availabilities: true } },
    });

    if (!booking) throw new NotFoundException('No se encontró un booking con ese id.')
    
    for (const availability of booking.bookingDetails.availabilities) {
      await this.roomAvailabilityDBRepository.update(
        { id: availability.id },
        { isDeleted: true },
      );
    }

    await this.bookingDBRepository.update({ id: booking.id }, { isDeleted: true })
    await this.bookingDetailsDBRepository.update({ id: booking.bookingDetails.id }, { isDeleted: true, status: BookingDetailsStatus.CANCELLED })
    return "El booking, su bookigDetails y sus availabilities han sido borrados con un borrado lógico."
  }
}
