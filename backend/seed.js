require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Stadium = require('./models/Stadium');
const Slot = require('./models/Slot');
const Reservation = require('./models/Reservation');
const Message = require('./models/Message');

const fromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  await Promise.all([
    User.deleteMany({}),
    Stadium.deleteMany({}),
    Slot.deleteMany({}),
    Reservation.deleteMany({}),
    Message.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash('password123', 10);

  const [owner1, owner2, owner3, owner4, user1, user2, user3, user4, user5] = await User.insertMany([
    { name: 'Ahmad Al-Rashid',   email: 'ahmad@owner.com',  password: hashedPw, role: 'owner' },
    { name: 'Khalid Al-Otaibi',  email: 'khalid@owner.com', password: hashedPw, role: 'owner' },
    { name: 'Nasser Al-Ghamdi',  email: 'nasser@owner.com', password: hashedPw, role: 'owner' },
    { name: 'Tariq Al-Zahrani',  email: 'tariq@owner.com',  password: hashedPw, role: 'owner' },
    { name: 'Faisal Al-Qahtani', email: 'faisal@user.com',  password: hashedPw, role: 'user' },
    { name: 'Omar Al-Harbi',     email: 'omar@user.com',    password: hashedPw, role: 'user' },
    { name: 'Youssef Al-Shehri', email: 'youssef@user.com', password: hashedPw, role: 'user' },
    { name: 'Bandar Al-Dosari',  email: 'bandar@user.com',  password: hashedPw, role: 'user' },
    { name: 'Saad Al-Mutairi',   email: 'saad@user.com',    password: hashedPw, role: 'user' },
  ]);
  console.log('Created 9 users (4 owners, 5 users)');

  // ── Stadiums ───────────────────────────────────────────────────────────────
  // Amenities are restricted to: WC, Parking, Showers, Prayer Room, Changing Rooms, Vendor Booth
  // Cities match the app dropdown: Abha, Dammam, Al-Khubar, Al-Taif, Buraydah,
  //   Dhahran, Hail, Jeddah, Mecca, Madinah, Riyadh, Tabuk, Yanbu
  const stadiumDocs = await Stadium.insertMany([
    // 1
    {
      name: 'Al-Noor Sports Complex',
      description: 'A premium 5-a-side turf with floodlights and a small spectator stand. The surface is FIFA-certified artificial grass, suitable for all weather conditions. Well-maintained with clean facilities for players.',
      location: 'Riyadh',
      photos: ['/uploads/Stad1.1.jpg', '/uploads/Stad1.2.jpg'],
      amenities: ['WC', 'Parking', 'Prayer Room', 'Changing Rooms'],
      owner: owner1._id
    },
    // 2
    {
      name: 'Green Valley Football Park',
      description: 'Spacious 7-a-side outdoor pitch with natural grass. Great for weekend leagues and team training sessions. Players can freshen up after matches with the on-site shower facilities.',
      location: 'Jeddah',
      photos: ['/uploads/Stad2.1.jpg', '/uploads/Stad2.2.jpg', '/uploads/Stad2.3.jpg'],
      amenities: ['WC', 'Parking', 'Showers', 'Changing Rooms'],
      owner: owner1._id
    },
    // 3
    {
      name: 'Champions Arena',
      description: 'Indoor 5-a-side hall with high-quality rubberized flooring and professional lighting for night matches. Fully equipped with player facilities including showers and private changing rooms.',
      location: 'Riyadh',
      photos: ['/uploads/Stad3.1.jpg', '/uploads/Stad3.2.jpg'],
      amenities: ['WC', 'Showers', 'Prayer Room', 'Changing Rooms', 'Vendor Booth'],
      owner: owner2._id
    },
    // 4
    {
      name: 'Sunset Turf Dammam',
      description: 'Artificial turf pitch ideal for evening matches. Popular for sunset kick-offs, with clean on-site facilities for players. Easy access with ample parking nearby.',
      location: 'Dammam',
      photos: ['/uploads/Stad4.1.jpg', '/uploads/Stad4.2.jpg'],
      amenities: ['WC', 'Parking', 'Showers'],
      owner: owner2._id
    },
    // 5
    {
      name: 'Al-Madinah Football Hub',
      description: 'Two full-size pitches popular with local clubs and youth academies. Located in a central area with easy access. Features a dedicated prayer room on-site for players.',
      location: 'Madinah',
      photos: ['/uploads/Stad5.1.jpg', '/uploads/Stad5.2.jpg'],
      amenities: ['WC', 'Parking', 'Prayer Room', 'Changing Rooms'],
      owner: owner2._id
    },
    // 6
    {
      name: 'Al-Khobar Elite Pitch',
      description: 'Modern 6-a-side turf facility in the heart of Al-Khubar. Features a pro-grade synthetic surface and is fully equipped with player amenities including showers and changing rooms.',
      location: 'Al-Khubar',
      photos: ['/uploads/Stad6.1.jpeg', '/uploads/Stad6.2.jpeg'],
      amenities: ['WC', 'Parking', 'Showers', 'Changing Rooms', 'Vendor Booth'],
      owner: owner3._id
    },
    // 7
    {
      name: 'Abha Highland Arena',
      description: 'Outdoor 5-a-side pitch in the cool highlands of Abha offering a refreshing playing experience. Natural grass surface with open-air seating for spectators. Prayer room available on-site.',
      location: 'Abha',
      photos: ['/uploads/Stad7.1.jpeg', '/uploads/Stad7.2.jpeg'],
      amenities: ['WC', 'Parking', 'Prayer Room'],
      owner: owner3._id
    },
    // 8
    {
      name: 'Al-Taif Sports Village',
      description: 'Family-friendly complex with two 5-a-side pitches and a 7-a-side pitch. Fully equipped with showers, changing rooms, and a prayer room for player comfort.',
      location: 'Al-Taif',
      photos: ['/uploads/Stad8.1.jpeg', '/uploads/Stad8.2.jpeg'],
      amenities: ['WC', 'Parking', 'Showers', 'Prayer Room', 'Changing Rooms'],
      owner: owner3._id
    },
    // 9
    {
      name: 'Mecca Royal Football Ground',
      description: 'Top-tier 7-a-side pitch located near the city center. FIFA-quality artificial turf with full lighting and stadium seating for spectators. Dedicated prayer room and changing facilities available.',
      location: 'Mecca',
      photos: ['/uploads/Stad9.1.jpeg', '/uploads/Stad9.2.jpeg'],
      amenities: ['WC', 'Parking', 'Prayer Room', 'Changing Rooms'],
      owner: owner1._id
    },
    // 10
    {
      name: 'Yanbu Coastal Pitch',
      description: 'A 5-a-side turf pitch popular for weekend leagues. Offers clean on-site shower facilities and plenty of parking space. Great atmosphere for competitive matches.',
      location: 'Yanbu',
      photos: ['/uploads/Stad10.1.jpeg', '/uploads/Stad10.2.jpeg'],
      amenities: ['WC', 'Parking', 'Showers'],
      owner: owner2._id
    },
    // 11
    {
      name: 'Diriyah Heritage Pitch',
      description: 'A well-maintained 5-a-side pitch adjacent to the Diriyah heritage area. Artificial turf with ambient evening lighting and open-air seating for spectators. Ideal for evening matches.',
      location: 'Riyadh',
      photos: ['/uploads/Stad3.1.jpg', '/uploads/Stad1.2.jpg'],
      amenities: ['WC', 'Parking', 'Prayer Room'],
      owner: owner4._id
    },
    // 12
    {
      name: 'Corniche Football Club',
      description: 'A lively 6-a-side pitch on the Jeddah waterfront. Synthetic turf in excellent condition with on-site shower facilities. A favourite for after-work matches.',
      location: 'Jeddah',
      photos: ['/uploads/Stad4.1.jpg', '/uploads/Stad2.3.jpg'],
      amenities: ['WC', 'Parking', 'Showers', 'Vendor Booth'],
      owner: owner4._id
    },
    // 13
    {
      name: 'Eastern United Sports Hub',
      description: 'Large indoor sports complex in Dammam hosting two 5-a-side courts with rubber flooring. Fully equipped with showers, changing rooms, and a prayer room on site.',
      location: 'Dammam',
      photos: ['/uploads/Stad6.1.jpeg', '/uploads/Stad5.2.jpg'],
      amenities: ['WC', 'Showers', 'Prayer Room', 'Changing Rooms'],
      owner: owner4._id
    },
    // 14
    {
      name: 'Tabuk Desert Arena',
      description: 'Outdoor 7-a-side pitch set against Tabuk\'s dramatic landscape. Fully shaded spectator stands and premium artificial turf. Changing rooms available for all players.',
      location: 'Tabuk',
      photos: ['/uploads/Stad7.1.jpeg', '/uploads/Stad8.2.jpeg'],
      amenities: ['WC', 'Parking', 'Changing Rooms'],
      owner: owner3._id
    },
    // 15
    {
      name: 'Hail Valley Football Ground',
      description: 'Community-run 5-a-side pitch in Hail with a welcoming local atmosphere. Ideal for casual matches and youth training. Features a prayer room and vendor booth for player convenience.',
      location: 'Hail',
      photos: ['/uploads/Stad9.1.jpeg', '/uploads/Stad5.1.jpg'],
      amenities: ['WC', 'Parking', 'Prayer Room', 'Vendor Booth'],
      owner: owner4._id
    },
  ]);

  const [s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15] = stadiumDocs;
  console.log(`Created ${stadiumDocs.length} stadiums`);

  // ── Slots ──────────────────────────────────────────────────────────────────
  const slotDefs = [
    // s1 — Al-Noor Sports Complex
    { stadium: s1._id, date: fromNow(1), startTime: '07:00', endTime: '08:00' },
    { stadium: s1._id, date: fromNow(1), startTime: '09:00', endTime: '10:00' },
    { stadium: s1._id, date: fromNow(1), startTime: '11:00', endTime: '12:00' },
    { stadium: s1._id, date: fromNow(1), startTime: '14:00', endTime: '15:00' },
    { stadium: s1._id, date: fromNow(1), startTime: '17:00', endTime: '18:00' },
    { stadium: s1._id, date: fromNow(2), startTime: '08:00', endTime: '09:00' },
    { stadium: s1._id, date: fromNow(2), startTime: '10:00', endTime: '11:00' },
    { stadium: s1._id, date: fromNow(2), startTime: '16:00', endTime: '17:00' },
    { stadium: s1._id, date: fromNow(3), startTime: '08:00', endTime: '09:00' },
    { stadium: s1._id, date: fromNow(3), startTime: '13:00', endTime: '14:00' },
    { stadium: s1._id, date: fromNow(4), startTime: '09:00', endTime: '10:00' },
    { stadium: s1._id, date: fromNow(5), startTime: '10:00', endTime: '11:00' },
    { stadium: s1._id, date: fromNow(6), startTime: '15:00', endTime: '16:00' },
    { stadium: s1._id, date: fromNow(7), startTime: '18:00', endTime: '19:00' },

    // s2 — Green Valley Football Park
    { stadium: s2._id, date: fromNow(1), startTime: '06:00', endTime: '07:00' },
    { stadium: s2._id, date: fromNow(1), startTime: '10:00', endTime: '11:00' },
    { stadium: s2._id, date: fromNow(1), startTime: '15:00', endTime: '16:00' },
    { stadium: s2._id, date: fromNow(2), startTime: '09:00', endTime: '10:00' },
    { stadium: s2._id, date: fromNow(2), startTime: '17:00', endTime: '18:00' },
    { stadium: s2._id, date: fromNow(3), startTime: '08:00', endTime: '09:00' },
    { stadium: s2._id, date: fromNow(3), startTime: '14:00', endTime: '15:00' },
    { stadium: s2._id, date: fromNow(4), startTime: '11:00', endTime: '12:00' },
    { stadium: s2._id, date: fromNow(5), startTime: '16:00', endTime: '17:00' },
    { stadium: s2._id, date: fromNow(6), startTime: '09:00', endTime: '10:00' },
    { stadium: s2._id, date: fromNow(7), startTime: '13:00', endTime: '14:00' },

    // s3 — Champions Arena
    { stadium: s3._id, date: fromNow(1), startTime: '08:00', endTime: '09:00' },
    { stadium: s3._id, date: fromNow(1), startTime: '19:00', endTime: '20:00' },
    { stadium: s3._id, date: fromNow(2), startTime: '10:00', endTime: '11:00' },
    { stadium: s3._id, date: fromNow(2), startTime: '12:00', endTime: '13:00' },
    { stadium: s3._id, date: fromNow(3), startTime: '15:00', endTime: '16:00' },
    { stadium: s3._id, date: fromNow(3), startTime: '18:00', endTime: '19:00' },
    { stadium: s3._id, date: fromNow(4), startTime: '09:00', endTime: '10:00' },
    { stadium: s3._id, date: fromNow(5), startTime: '20:00', endTime: '21:00' },
    { stadium: s3._id, date: fromNow(6), startTime: '11:00', endTime: '12:00' },
    { stadium: s3._id, date: fromNow(7), startTime: '17:00', endTime: '18:00' },

    // s4 — Sunset Turf Dammam
    { stadium: s4._id, date: fromNow(1), startTime: '07:00', endTime: '08:00' },
    { stadium: s4._id, date: fromNow(1), startTime: '17:00', endTime: '18:00' },
    { stadium: s4._id, date: fromNow(2), startTime: '08:00', endTime: '09:00' },
    { stadium: s4._id, date: fromNow(2), startTime: '15:00', endTime: '16:00' },
    { stadium: s4._id, date: fromNow(3), startTime: '10:00', endTime: '11:00' },
    { stadium: s4._id, date: fromNow(3), startTime: '18:00', endTime: '19:00' },
    { stadium: s4._id, date: fromNow(4), startTime: '09:00', endTime: '10:00' },
    { stadium: s4._id, date: fromNow(5), startTime: '16:00', endTime: '17:00' },
    { stadium: s4._id, date: fromNow(6), startTime: '14:00', endTime: '15:00' },
    { stadium: s4._id, date: fromNow(7), startTime: '11:00', endTime: '12:00' },

    // s5 — Al-Madinah Football Hub
    { stadium: s5._id, date: fromNow(1), startTime: '06:00', endTime: '07:00' },
    { stadium: s5._id, date: fromNow(1), startTime: '20:00', endTime: '21:00' },
    { stadium: s5._id, date: fromNow(2), startTime: '07:00', endTime: '08:00' },
    { stadium: s5._id, date: fromNow(2), startTime: '14:00', endTime: '15:00' },
    { stadium: s5._id, date: fromNow(3), startTime: '09:00', endTime: '10:00' },
    { stadium: s5._id, date: fromNow(4), startTime: '11:00', endTime: '12:00' },
    { stadium: s5._id, date: fromNow(4), startTime: '18:00', endTime: '19:00' },
    { stadium: s5._id, date: fromNow(5), startTime: '08:00', endTime: '09:00' },
    { stadium: s5._id, date: fromNow(6), startTime: '13:00', endTime: '14:00' },
    { stadium: s5._id, date: fromNow(7), startTime: '19:00', endTime: '20:00' },

    // s6 — Al-Khobar Elite Pitch
    { stadium: s6._id, date: fromNow(1), startTime: '08:00', endTime: '09:00' },
    { stadium: s6._id, date: fromNow(1), startTime: '11:00', endTime: '12:00' },
    { stadium: s6._id, date: fromNow(1), startTime: '16:00', endTime: '17:00' },
    { stadium: s6._id, date: fromNow(2), startTime: '09:00', endTime: '10:00' },
    { stadium: s6._id, date: fromNow(2), startTime: '14:00', endTime: '15:00' },
    { stadium: s6._id, date: fromNow(3), startTime: '10:00', endTime: '11:00' },
    { stadium: s6._id, date: fromNow(3), startTime: '19:00', endTime: '20:00' },
    { stadium: s6._id, date: fromNow(4), startTime: '08:00', endTime: '09:00' },
    { stadium: s6._id, date: fromNow(5), startTime: '15:00', endTime: '16:00' },
    { stadium: s6._id, date: fromNow(6), startTime: '20:00', endTime: '21:00' },
    { stadium: s6._id, date: fromNow(7), startTime: '12:00', endTime: '13:00' },

    // s7 — Abha Highland Arena
    { stadium: s7._id, date: fromNow(1), startTime: '07:00', endTime: '08:00' },
    { stadium: s7._id, date: fromNow(1), startTime: '14:00', endTime: '15:00' },
    { stadium: s7._id, date: fromNow(2), startTime: '09:00', endTime: '10:00' },
    { stadium: s7._id, date: fromNow(2), startTime: '16:00', endTime: '17:00' },
    { stadium: s7._id, date: fromNow(3), startTime: '08:00', endTime: '09:00' },
    { stadium: s7._id, date: fromNow(4), startTime: '13:00', endTime: '14:00' },
    { stadium: s7._id, date: fromNow(5), startTime: '10:00', endTime: '11:00' },
    { stadium: s7._id, date: fromNow(6), startTime: '17:00', endTime: '18:00' },
    { stadium: s7._id, date: fromNow(7), startTime: '09:00', endTime: '10:00' },

    // s8 — Al-Taif Sports Village
    { stadium: s8._id, date: fromNow(1), startTime: '09:00', endTime: '10:00' },
    { stadium: s8._id, date: fromNow(1), startTime: '18:00', endTime: '19:00' },
    { stadium: s8._id, date: fromNow(2), startTime: '11:00', endTime: '12:00' },
    { stadium: s8._id, date: fromNow(3), startTime: '08:00', endTime: '09:00' },
    { stadium: s8._id, date: fromNow(3), startTime: '15:00', endTime: '16:00' },
    { stadium: s8._id, date: fromNow(4), startTime: '10:00', endTime: '11:00' },
    { stadium: s8._id, date: fromNow(5), startTime: '14:00', endTime: '15:00' },
    { stadium: s8._id, date: fromNow(6), startTime: '16:00', endTime: '17:00' },
    { stadium: s8._id, date: fromNow(7), startTime: '20:00', endTime: '21:00' },

    // s9 — Mecca Royal Football Ground
    { stadium: s9._id, date: fromNow(1), startTime: '06:00', endTime: '07:00' },
    { stadium: s9._id, date: fromNow(1), startTime: '10:00', endTime: '11:00' },
    { stadium: s9._id, date: fromNow(2), startTime: '08:00', endTime: '09:00' },
    { stadium: s9._id, date: fromNow(2), startTime: '17:00', endTime: '18:00' },
    { stadium: s9._id, date: fromNow(3), startTime: '12:00', endTime: '13:00' },
    { stadium: s9._id, date: fromNow(4), startTime: '09:00', endTime: '10:00' },
    { stadium: s9._id, date: fromNow(5), startTime: '19:00', endTime: '20:00' },
    { stadium: s9._id, date: fromNow(6), startTime: '11:00', endTime: '12:00' },
    { stadium: s9._id, date: fromNow(7), startTime: '15:00', endTime: '16:00' },

    // s10 — Yanbu Coastal Pitch
    { stadium: s10._id, date: fromNow(1), startTime: '08:00', endTime: '09:00' },
    { stadium: s10._id, date: fromNow(1), startTime: '15:00', endTime: '16:00' },
    { stadium: s10._id, date: fromNow(2), startTime: '10:00', endTime: '11:00' },
    { stadium: s10._id, date: fromNow(2), startTime: '18:00', endTime: '19:00' },
    { stadium: s10._id, date: fromNow(3), startTime: '09:00', endTime: '10:00' },
    { stadium: s10._id, date: fromNow(4), startTime: '14:00', endTime: '15:00' },
    { stadium: s10._id, date: fromNow(5), startTime: '11:00', endTime: '12:00' },
    { stadium: s10._id, date: fromNow(6), startTime: '16:00', endTime: '17:00' },
    { stadium: s10._id, date: fromNow(7), startTime: '08:00', endTime: '09:00' },

    // s11 — Diriyah Heritage Pitch
    { stadium: s11._id, date: fromNow(1), startTime: '08:00', endTime: '09:00' },
    { stadium: s11._id, date: fromNow(1), startTime: '17:00', endTime: '18:00' },
    { stadium: s11._id, date: fromNow(2), startTime: '10:00', endTime: '11:00' },
    { stadium: s11._id, date: fromNow(3), startTime: '09:00', endTime: '10:00' },
    { stadium: s11._id, date: fromNow(3), startTime: '19:00', endTime: '20:00' },
    { stadium: s11._id, date: fromNow(4), startTime: '14:00', endTime: '15:00' },
    { stadium: s11._id, date: fromNow(5), startTime: '11:00', endTime: '12:00' },
    { stadium: s11._id, date: fromNow(6), startTime: '16:00', endTime: '17:00' },
    { stadium: s11._id, date: fromNow(7), startTime: '20:00', endTime: '21:00' },

    // s12 — Corniche Football Club
    { stadium: s12._id, date: fromNow(1), startTime: '07:00', endTime: '08:00' },
    { stadium: s12._id, date: fromNow(1), startTime: '16:00', endTime: '17:00' },
    { stadium: s12._id, date: fromNow(2), startTime: '09:00', endTime: '10:00' },
    { stadium: s12._id, date: fromNow(2), startTime: '19:00', endTime: '20:00' },
    { stadium: s12._id, date: fromNow(3), startTime: '11:00', endTime: '12:00' },
    { stadium: s12._id, date: fromNow(4), startTime: '08:00', endTime: '09:00' },
    { stadium: s12._id, date: fromNow(5), startTime: '15:00', endTime: '16:00' },
    { stadium: s12._id, date: fromNow(6), startTime: '18:00', endTime: '19:00' },
    { stadium: s12._id, date: fromNow(7), startTime: '10:00', endTime: '11:00' },

    // s13 — Eastern United Sports Hub
    { stadium: s13._id, date: fromNow(1), startTime: '09:00', endTime: '10:00' },
    { stadium: s13._id, date: fromNow(1), startTime: '20:00', endTime: '21:00' },
    { stadium: s13._id, date: fromNow(2), startTime: '11:00', endTime: '12:00' },
    { stadium: s13._id, date: fromNow(3), startTime: '08:00', endTime: '09:00' },
    { stadium: s13._id, date: fromNow(3), startTime: '14:00', endTime: '15:00' },
    { stadium: s13._id, date: fromNow(4), startTime: '10:00', endTime: '11:00' },
    { stadium: s13._id, date: fromNow(5), startTime: '17:00', endTime: '18:00' },
    { stadium: s13._id, date: fromNow(6), startTime: '13:00', endTime: '14:00' },
    { stadium: s13._id, date: fromNow(7), startTime: '19:00', endTime: '20:00' },

    // s14 — Tabuk Desert Arena
    { stadium: s14._id, date: fromNow(1), startTime: '06:00', endTime: '07:00' },
    { stadium: s14._id, date: fromNow(1), startTime: '18:00', endTime: '19:00' },
    { stadium: s14._id, date: fromNow(2), startTime: '09:00', endTime: '10:00' },
    { stadium: s14._id, date: fromNow(3), startTime: '15:00', endTime: '16:00' },
    { stadium: s14._id, date: fromNow(4), startTime: '08:00', endTime: '09:00' },
    { stadium: s14._id, date: fromNow(5), startTime: '12:00', endTime: '13:00' },
    { stadium: s14._id, date: fromNow(6), startTime: '17:00', endTime: '18:00' },
    { stadium: s14._id, date: fromNow(7), startTime: '10:00', endTime: '11:00' },

    // s15 — Hail Valley Football Ground
    { stadium: s15._id, date: fromNow(1), startTime: '07:00', endTime: '08:00' },
    { stadium: s15._id, date: fromNow(1), startTime: '19:00', endTime: '20:00' },
    { stadium: s15._id, date: fromNow(2), startTime: '10:00', endTime: '11:00' },
    { stadium: s15._id, date: fromNow(3), startTime: '09:00', endTime: '10:00' },
    { stadium: s15._id, date: fromNow(4), startTime: '16:00', endTime: '17:00' },
    { stadium: s15._id, date: fromNow(5), startTime: '08:00', endTime: '09:00' },
    { stadium: s15._id, date: fromNow(6), startTime: '14:00', endTime: '15:00' },
    { stadium: s15._id, date: fromNow(7), startTime: '20:00', endTime: '21:00' },
  ];

  const slots = await Slot.insertMany(slotDefs);
  console.log(`Created ${slots.length} slots`);

  // ── Reservations ───────────────────────────────────────────────────────────
  // s1:  0–13   (14 slots) → reserve indices 0,1,3,6
  // s2:  14–24  (11 slots) → reserve indices 14,16,19
  // s3:  25–34  (10 slots) → reserve indices 25,27,30
  // s4:  35–44  (10 slots) → reserve indices 35,37,40
  // s5:  45–54  (10 slots) → reserve indices 45,47,50
  // s6:  55–65  (11 slots) → reserve indices 55,57,60
  // s7:  66–74  ( 9 slots) → reserve indices 66,68
  // s8:  75–83  ( 9 slots) → reserve indices 75,77
  // s9:  84–92  ( 9 slots) → reserve indices 84,86
  // s10: 93–101 ( 9 slots) → reserve indices 93,95
  // s11: 102–110( 9 slots) → reserve indices 102,104
  // s12: 111–119( 9 slots) → reserve indices 111,113
  // s13: 120–128( 9 slots) → reserve indices 120,122
  // s14: 129–136( 8 slots) → reserve indices 129,131
  // s15: 137–144( 8 slots) → reserve indices 137,139
  const reservationPairs = [
    { slotIdx: 0,   user: user1._id },
    { slotIdx: 1,   user: user2._id },
    { slotIdx: 3,   user: user3._id },
    { slotIdx: 6,   user: user4._id },
    { slotIdx: 14,  user: user5._id },
    { slotIdx: 16,  user: user1._id },
    { slotIdx: 19,  user: user2._id },
    { slotIdx: 25,  user: user3._id },
    { slotIdx: 27,  user: user4._id },
    { slotIdx: 30,  user: user5._id },
    { slotIdx: 35,  user: user1._id },
    { slotIdx: 37,  user: user2._id },
    { slotIdx: 40,  user: user3._id },
    { slotIdx: 45,  user: user4._id },
    { slotIdx: 47,  user: user5._id },
    { slotIdx: 50,  user: user1._id },
    { slotIdx: 55,  user: user2._id },
    { slotIdx: 57,  user: user3._id },
    { slotIdx: 60,  user: user4._id },
    { slotIdx: 66,  user: user5._id },
    { slotIdx: 68,  user: user1._id },
    { slotIdx: 75,  user: user2._id },
    { slotIdx: 77,  user: user3._id },
    { slotIdx: 84,  user: user4._id },
    { slotIdx: 86,  user: user5._id },
    { slotIdx: 93,  user: user1._id },
    { slotIdx: 95,  user: user2._id },
    { slotIdx: 102, user: user3._id },
    { slotIdx: 104, user: user4._id },
    { slotIdx: 111, user: user5._id },
    { slotIdx: 113, user: user1._id },
    { slotIdx: 120, user: user2._id },
    { slotIdx: 122, user: user3._id },
    { slotIdx: 129, user: user4._id },
    { slotIdx: 131, user: user5._id },
    { slotIdx: 137, user: user1._id },
    { slotIdx: 139, user: user2._id },
  ];

  const reservationDocs = reservationPairs.map(({ slotIdx, user }) => ({
    slot: slots[slotIdx]._id,
    stadium: slots[slotIdx].stadium,
    user,
    status: 'active'
  }));
  await Reservation.insertMany(reservationDocs);

  const reservedSlotIds = reservationPairs.map(p => slots[p.slotIdx]._id);
  await Slot.updateMany({ _id: { $in: reservedSlotIds } }, { isReserved: true });
  console.log(`Created ${reservationPairs.length} reservations`);

  // ── Messages ───────────────────────────────────────────────────────────────
  // All messages reference only actual facilities: WC, Parking, Showers, Prayer Room, Changing Rooms, Vendor Booth
  await Message.insertMany([
    { sender: user1._id,  receiver: owner1._id, stadium: s1._id,  content: 'Hi, is there parking available at Al-Noor? We have a team of 10 coming.' },
    { sender: owner1._id, receiver: user1._id,  stadium: s1._id,  content: 'Yes, we have free parking with plenty of space. See you there!' },
    { sender: user3._id,  receiver: owner2._id, stadium: s3._id,  content: 'Do you have changing rooms and showers at Champions Arena? Planning a match after work.' },
    { sender: owner2._id, receiver: user3._id,  stadium: s3._id,  content: 'Yes, we have full changing rooms and showers available for all players.' },
    { sender: user2._id,  receiver: owner1._id, stadium: s2._id,  content: 'Is there a prayer room at Green Valley? Some of our players need it.' },
    { sender: owner1._id, receiver: user2._id,  stadium: s2._id,  content: 'We do not have a prayer room at this pitch, but there is a mosque nearby. Showers and changing rooms are available on-site.' },
    { sender: user4._id,  receiver: owner2._id, stadium: s4._id,  content: 'Are the showers at Sunset Turf clean and available after every match?' },
    { sender: owner2._id, receiver: user4._id,  stadium: s4._id,  content: 'Yes, showers are clean and available for all players after every session.' },
    { sender: user1._id,  receiver: owner3._id, stadium: s6._id,  content: 'Does Al-Khobar Elite Pitch have a prayer room?' },
    { sender: owner3._id, receiver: user1._id,  stadium: s6._id,  content: 'We do not have a prayer room, but we have full changing rooms, showers, and a vendor booth on-site.' },
    { sender: user3._id,  receiver: owner3._id, stadium: s7._id,  content: 'Is parking available at Abha Highland Arena? We are bringing two cars.' },
    { sender: owner3._id, receiver: user3._id,  stadium: s7._id,  content: 'Yes, we have parking for multiple cars. Also a prayer room is available on-site.' },
    { sender: user5._id,  receiver: owner4._id, stadium: s11._id, content: 'Does Diriyah Heritage Pitch have changing rooms for players?' },
    { sender: owner4._id, receiver: user5._id,  stadium: s11._id, content: 'We currently do not have changing rooms, but WC, parking, and a prayer room are available.' },
    { sender: user2._id,  receiver: owner4._id, stadium: s15._id, content: 'Is there a vendor booth at Hail Valley Ground? We need to grab some drinks.' },
    { sender: owner4._id, receiver: user2._id,  stadium: s15._id, content: 'Yes, we have a vendor booth on-site. Prayer room and parking are also available.' },
  ]);
  console.log('Created 16 messages');

  console.log('\n✓ Seed complete! Credentials (all passwords: password123):');
  console.log('  Owners: ahmad@owner.com | khalid@owner.com | nasser@owner.com | tariq@owner.com');
  console.log('  Users:  faisal@user.com | omar@user.com | youssef@user.com | bandar@user.com | saad@user.com');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
