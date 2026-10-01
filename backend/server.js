const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const { GetObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const requiredEnv = [
  'MONGODB_URI',
  'AWS_BUCKET_NAME',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

const app = express();
const port = Number(process.env.PORT || 4000);
const maxImageSizeMb = Number(process.env.MAX_IMAGE_SIZE_MB || 10);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxImageSizeMb * 1024 * 1024,
    files: 16,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});

const uploadAny = upload.any();

const imageSchema = new mongoose.Schema(
  {
    field: String,
    url: String,
    key: String,
    originalName: String,
    size: Number,
    contentType: String,
  },
  { _id: false },
);

const clientRegistrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    city: { type: String, required: true },
    birthDate: String,
    gender: String,
    phone: { type: String, index: true, unique: true, sparse: true },
    photos: {
      main: imageSchema,
      extra: [imageSchema],
    },
    status: { type: String, default: 'completed' },
    accountStatus: { type: String, default: 'active' },
  },
  { timestamps: true },
);

const masterRegistrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, index: true },
    city: { type: String, required: true },
    birthDate: String,
    gender: String,
    experience: String,
    workFormat: String,
    about: String,
    portfolio: String,
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalonRegistration', index: true },
    agreement: Boolean,
    personalData: Boolean,
    documents: {
      id: imageSchema,
      certificates: [imageSchema],
      diplomas: [imageSchema],
      licenses: [imageSchema],
    },
    status: { type: String, default: 'pending_review' },
    accountStatus: { type: String, default: 'active' },
    adminComment: String,
    reviewedAt: Date,
  },
  { timestamps: true },
);

const salonRegistrationSchema = new mongoose.Schema(
  {
    salonName: { type: String, required: true },
    ownerName: String,
    city: String,
    phone: { type: String, index: true },
    website: String,
    legalName: String,
    address: String,
    workDays: String,
    openTime: String,
    closeTime: String,
    description: String,
    documents: {
      ownerId: imageSchema,
      licenses: [imageSchema],
      certificates: [imageSchema],
      photos: [imageSchema],
    },
    status: { type: String, default: 'pending_review' },
    accountStatus: { type: String, default: 'active' },
    adminComment: String,
    reviewedAt: Date,
  },
  { timestamps: true },
);

const clientAppointmentSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientRegistration', index: true },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalonRegistration' },
    masterId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterRegistration' },
    serviceName: { type: String, required: true },
    salonName: String,
    masterName: String,
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: String,
    image: String,
    price: String,
    status: { type: String, default: 'confirmed', index: true },
    notes: String,
  },
  { timestamps: true },
);

const clientFavoriteSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientRegistration', index: true, required: true },
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ['master', 'salon'], required: true },
    snapshot: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

clientFavoriteSchema.index({ clientId: 1, targetType: 1, targetId: 1 }, { unique: true });

const ClientRegistration = mongoose.model('ClientRegistration', clientRegistrationSchema);
const MasterRegistration = mongoose.model('MasterRegistration', masterRegistrationSchema);
const SalonRegistration = mongoose.model('SalonRegistration', salonRegistrationSchema);
const ClientAppointment = mongoose.model('ClientAppointment', clientAppointmentSchema);
const ClientFavorite = mongoose.model('ClientFavorite', clientFavoriteSchema);
const clientListFields = 'fullName city phone status accountStatus createdAt reviewedAt';
const masterListFields = 'fullName city phone experience status accountStatus createdAt reviewedAt';
const salonListFields = 'salonName ownerName city phone status accountStatus createdAt reviewedAt';

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '24mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/auth/profile', async (req, res) => {
  const { phone } = req.query;
  const normalizedPhone = normalizeKazakhstanPhone(phone);
  const [client, master, salon] = await Promise.all([
    ClientRegistration.findOne({
      accountStatus: { $ne: 'disabled' },
      phone: normalizedPhone,
    })
      .sort({ createdAt: -1 })
      .lean(),
    MasterRegistration.findOne({
      accountStatus: { $ne: 'disabled' },
      phone: normalizedPhone,
    })
      .sort({ createdAt: -1 })
      .lean(),
    SalonRegistration.findOne({
      accountStatus: { $ne: 'disabled' },
      phone: normalizedPhone,
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const accounts = [
    client
      ? {
          profile: normalizeClientProfile(
            await withSignedMemberUrls(normalizeMember('client', client, true)),
          ),
          role: 'client',
        }
      : null,
    master ? { profile: normalizePartnerProfile('master', master), role: 'master' } : null,
    salon ? { profile: normalizePartnerProfile('salon', salon), role: 'salon' } : null,
  ].filter(Boolean);

  if (!accounts.length) {
    res.status(404).json({ ok: false, message: 'Аккаунт с таким номером не найден' });
    return;
  }

  res.json({ accounts, normalizedPhone, ok: true });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ ok: false, message: 'Неверный пароль администратора' });
    return;
  }

  res.json({ ok: true, token: createAdminToken() });
});

app.get('/api/admin/applications', requireAdmin, async (req, res) => {
  const { search = '', type = 'all' } = req.query;
  const [masters, salons] = await Promise.all([
    type === 'all' || type === 'master'
      ? MasterRegistration.find({ status: 'pending_review' })
          .select(masterListFields)
          .sort({ createdAt: -1 })
          .lean()
      : [],
    type === 'all' || type === 'salon'
      ? SalonRegistration.find({ status: 'pending_review' })
          .select(salonListFields)
          .sort({ createdAt: -1 })
          .lean()
      : [],
  ]);

  const applications = [
    ...masters.map((item) => normalizeApplication('master', item)),
    ...salons.map((item) => normalizeApplication('salon', item)),
  ]
    .filter((item) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return [item.title, item.city, item.phone, item.subtitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [pendingMasters, pendingSalons, approvedMasters, approvedSalons, clients] = await Promise.all([
    MasterRegistration.countDocuments({ status: 'pending_review' }),
    SalonRegistration.countDocuments({ status: 'pending_review' }),
    MasterRegistration.countDocuments({ status: 'approved' }),
    SalonRegistration.countDocuments({ status: 'approved' }),
    ClientRegistration.countDocuments(),
  ]);

  res.json({
    ok: true,
    applications,
    stats: {
      pending: pendingMasters + pendingSalons,
      pendingMasters,
      pendingSalons,
      approvedMasters,
      approvedSalons,
      clients,
      totalAccounts: clients + approvedMasters + approvedSalons,
    },
  });
});

app.get('/api/admin/applications/:type/:id', requireAdmin, async (req, res) => {
  const model = getApplicationModel(req.params.type);
  if (!model) {
    res.status(404).json({ ok: false, message: 'Неизвестный тип заявки' });
    return;
  }

  const application = await model.findById(req.params.id).lean();
  if (!application) {
    res.status(404).json({ ok: false, message: 'Заявка не найдена' });
    return;
  }

  res.json({
    ok: true,
    application: await withSignedDocumentUrls(normalizeApplication(req.params.type, application, true)),
  });
});

app.patch('/api/admin/applications/:type/:id', requireAdmin, async (req, res) => {
  const model = getApplicationModel(req.params.type);
  if (!model) {
    res.status(404).json({ ok: false, message: 'Неизвестный тип заявки' });
    return;
  }

  const update = sanitizeApplicationUpdate(req.params.type, req.body || {});
  const application = await model.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (!application) {
    res.status(404).json({ ok: false, message: 'Заявка не найдена' });
    return;
  }

  res.json({
    ok: true,
    application: await withSignedDocumentUrls(normalizeApplication(req.params.type, application, true)),
  });
});

app.patch('/api/admin/applications/:type/:id/status', requireAdmin, async (req, res) => {
  const { adminComment = '', status } = req.body || {};
  const allowedStatuses = ['pending_review', 'approved', 'rejected'];
  const model = getApplicationModel(req.params.type);

  if (!model || !allowedStatuses.includes(status)) {
    res.status(400).json({ ok: false, message: 'Некорректный статус или тип заявки' });
    return;
  }

  const update = {
    adminComment,
    reviewedAt: status === 'pending_review' ? null : new Date(),
    status,
  };

  if (status === 'approved') {
    update.accountStatus = 'active';
  }

  const application = await model.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

  if (!application) {
    res.status(404).json({ ok: false, message: 'Заявка не найдена' });
    return;
  }

  res.json({
    ok: true,
    application: await withSignedDocumentUrls(normalizeApplication(req.params.type, application, true)),
  });
});

app.get('/api/admin/members/:type', requireAdmin, async (req, res) => {
  const { search = '' } = req.query;
  const type = req.params.type;
  const model = getMemberModel(type);

  if (!model) {
    res.status(404).json({ ok: false, message: 'Неизвестный раздел' });
    return;
  }

  const query = type === 'client' ? {} : { status: 'approved' };
  const fieldsByType = {
    client: clientListFields,
    master: masterListFields,
    salon: salonListFields,
  };
  const items = await model.find(query).select(fieldsByType[type]).sort({ createdAt: -1 }).lean();
  const term = search.trim().toLowerCase();
  const members = items
    .map((item) => normalizeMember(type, item))
    .filter((item) => {
      if (!term) return true;
      return [item.title, item.subtitle, item.city, item.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });

  res.json({ ok: true, members, stats: buildMemberStats(members) });
});

app.get('/api/admin/members/:type/:id', requireAdmin, async (req, res) => {
  const model = getMemberModel(req.params.type);

  if (!model) {
    res.status(404).json({ ok: false, message: 'Неизвестный раздел' });
    return;
  }

  const query =
    req.params.type === 'client'
      ? { _id: req.params.id }
      : { _id: req.params.id, status: 'approved' };
  const member = await model.findOne(query).lean();

  if (!member) {
    res.status(404).json({ ok: false, message: 'Профиль не найден' });
    return;
  }

  res.json({
    ok: true,
    member: await withSignedMemberUrls(normalizeMember(req.params.type, member, true)),
  });
});

app.patch('/api/admin/members/:type/:id/account-status', requireAdmin, async (req, res) => {
  const { accountStatus } = req.body || {};
  const allowedStatuses = ['active', 'disabled'];
  const model = getMemberModel(req.params.type);

  if (!model || !allowedStatuses.includes(accountStatus)) {
    res.status(400).json({ ok: false, message: 'Некорректный статус аккаунта' });
    return;
  }

  const query =
    req.params.type === 'client'
      ? { _id: req.params.id }
      : { _id: req.params.id, status: 'approved' };
  const member = await model.findOneAndUpdate(query, { accountStatus }, { new: true }).lean();

  if (!member) {
    res.status(404).json({ ok: false, message: 'Профиль не найден' });
    return;
  }

  res.json({
    ok: true,
    member: await withSignedMemberUrls(normalizeMember(req.params.type, member, true)),
  });
});

app.post('/api/client-registrations', multipartHandler, async (req, res) => {
  const payload = parsePayload(req.body.payload);
  const normalizedPhone = normalizeKazakhstanPhone(payload.phone);
  await assertUniqueClientPhone(normalizedPhone);
  const uploaded = await uploadImages(req.files || [], 'clients');

  const registration = await ClientRegistration.create({
    ...payload,
    phone: normalizedPhone,
    photos: {
      main: uploaded.find((file) => file.field === 'mainPhoto') || null,
      extra: uploaded.filter((file) => file.field === 'extraPhotos'),
    },
  });

  res.status(201).json({ ok: true, id: registration._id, registration });
});

app.post('/api/client-registrations-json', async (req, res) => {
  const { images = {}, payload = {} } = req.body || {};
  const normalizedPhone = normalizeKazakhstanPhone(payload.phone);
  await assertUniqueClientPhone(normalizedPhone);
  const uploaded = await uploadImagesFromJson(
    [
      images.mainPhoto ? { ...images.mainPhoto, field: 'mainPhoto' } : null,
      ...(images.extraPhotos || []).map((image) => ({ ...image, field: 'extraPhotos' })),
    ].filter(Boolean),
    'clients',
  );

  const registration = await ClientRegistration.create({
    ...payload,
    phone: normalizedPhone,
    photos: {
      main: uploaded.find((file) => file.field === 'mainPhoto') || null,
      extra: uploaded.filter((file) => file.field === 'extraPhotos'),
    },
  });

  res.status(201).json({ ok: true, id: registration._id, registration });
});

app.post('/api/master-registrations', multipartHandler, async (req, res) => {
  const payload = parsePayload(req.body.payload);
  const normalizedPhone = normalizeKazakhstanPhone(payload.phone);
  await assertUniquePartnerPhone(MasterRegistration, normalizedPhone, 'Мастер');
  const uploaded = await uploadImages(req.files || [], 'masters');

  const registration = await MasterRegistration.create({
    ...payload,
    phone: normalizedPhone,
    documents: {
      id: uploaded.find((file) => file.field === 'idDocument') || null,
      certificates: uploaded.filter((file) => file.field === 'certificates'),
      diplomas: uploaded.filter((file) => file.field === 'diplomas'),
      licenses: uploaded.filter((file) => file.field === 'licenses'),
    },
    status: 'pending_review',
  });

  res.status(201).json({ ok: true, id: registration._id, registration });
});

app.post('/api/master-registrations-json', async (req, res) => {
  const { images = {}, payload = {} } = req.body || {};
  const normalizedPhone = normalizeKazakhstanPhone(payload.phone);
  await assertUniquePartnerPhone(MasterRegistration, normalizedPhone, 'Мастер');
  const uploaded = await uploadImagesFromJson(
    [
      images.idDocument ? { ...images.idDocument, field: 'idDocument' } : null,
      ...(images.certificates || []).map((image) => ({ ...image, field: 'certificates' })),
      ...(images.diplomas || []).map((image) => ({ ...image, field: 'diplomas' })),
      ...(images.licenses || []).map((image) => ({ ...image, field: 'licenses' })),
    ].filter(Boolean),
    'masters',
  );

  const registration = await MasterRegistration.create({
    ...payload,
    phone: normalizedPhone,
    documents: {
      id: uploaded.find((file) => file.field === 'idDocument') || null,
      certificates: uploaded.filter((file) => file.field === 'certificates'),
      diplomas: uploaded.filter((file) => file.field === 'diplomas'),
      licenses: uploaded.filter((file) => file.field === 'licenses'),
    },
    status: 'pending_review',
  });

  res.status(201).json({ ok: true, id: registration._id, registration });
});

app.get('/api/home', async (_req, res) => {
  const query = { accountStatus: { $ne: 'disabled' }, status: 'approved' };
  const [masters, salons] = await Promise.all([
    MasterRegistration.find(query).sort({ reviewedAt: -1, createdAt: -1 }).limit(12).lean(),
    SalonRegistration.find(query).sort({ reviewedAt: -1, createdAt: -1 }).limit(12).lean(),
  ]);

  res.json({
    ok: true,
    masters: await Promise.all(masters.map(normalizePublicMaster)),
    salons: await Promise.all(salons.map(normalizePublicSalon)),
  });
});

app.get('/api/salons/masters', async (req, res) => {
  const salon = await findPartnerForPublicProfile({
    id: req.query.salonId || req.query.id,
    phone: req.query.phone,
    role: 'salon',
  });
  if (!salon) {
    res.status(404).json({ ok: false, message: 'Салон не найден' });
    return;
  }

  const masters = await MasterRegistration.find({
    accountStatus: { $ne: 'disabled' },
    salonId: salon._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    masters: await Promise.all(masters.map(normalizePublicMaster)),
    ok: true,
    salon: { id: String(salon._id), name: salon.salonName },
  });
});

app.post('/api/salons/masters', async (req, res) => {
  const { masterPhone, salonId, salonPhone } = req.body || {};
  const salon = await findPartnerForPublicProfile({ id: salonId, phone: salonPhone, role: 'salon' });
  if (!salon || salon.status !== 'approved') {
    res.status(404).json({ ok: false, message: 'Активный салон не найден' });
    return;
  }

  const normalizedPhone = normalizeKazakhstanPhone(masterPhone);
  const master = await MasterRegistration.findOne({
    accountStatus: { $ne: 'disabled' },
    phone: normalizedPhone,
  });
  if (!master) {
    res.status(404).json({
      ok: false,
      message: 'Мастер с таким номером не найден. Сначала мастер должен зарегистрироваться.',
    });
    return;
  }

  if (master.salonId && String(master.salonId) !== String(salon._id)) {
    res.status(409).json({
      ok: false,
      message: 'Этот мастер уже прикреплён к другому салону',
    });
    return;
  }

  master.salonId = salon._id;
  master.workFormat = 'Мастер салона';
  await master.save();

  res.json({
    master: await normalizePublicMaster(master.toObject()),
    message: 'Мастер сразу прикреплён к салону',
    ok: true,
  });
});

app.get('/api/profile/client', async (req, res) => {
  const { id, phone } = req.query;
  const client = await findClientForPublicProfile({ id, phone });
  if (!client) {
    res.status(404).json({ ok: false, message: 'Профиль клиента не найден' });
    return;
  }

  const [activeAppointments, favoriteCount] = await Promise.all([
    ClientAppointment.countDocuments({
      clientId: client._id,
      status: { $in: ['pending', 'confirmed'] },
    }),
    ClientFavorite.countDocuments({ clientId: client._id }),
  ]);

  res.json({
    ok: true,
    profile: normalizeClientProfile(await withSignedMemberUrls(normalizeMember('client', client, true))),
    counters: {
      appointments: activeAppointments,
      favorites: favoriteCount,
      notifications: 0,
    },
  });
});

app.get('/api/profile/partner', async (req, res) => {
  const { id, phone, role } = req.query;
  const partner = await findPartnerForPublicProfile({ id, phone, role });
  if (!partner) {
    res.status(404).json({ ok: false, message: 'Профиль партнёра не найден' });
    return;
  }

  const relationField = role === 'salon' ? 'salonId' : 'masterId';
  const today = getAlmatyDateKey();
  const [activeAppointments, todayAppointments] = await Promise.all([
    ClientAppointment.countDocuments({
      [relationField]: partner._id,
      status: { $in: ['pending', 'confirmed'] },
    }),
    ClientAppointment.countDocuments({
      [relationField]: partner._id,
      date: today,
      status: { $in: ['pending', 'confirmed'] },
    }),
  ]);

  res.json({
    ok: true,
    profile: normalizePartnerProfile(role, partner),
    counters: {
      activeAppointments,
      todayAppointments,
    },
  });
});

app.delete('/api/profile/client', async (req, res) => {
  const { clientId, id, phone } = req.body || {};
  const client = await findClientForPublicProfile({ id: clientId || id, phone });

  if (!client) {
    res.status(404).json({ ok: false, message: 'Профиль клиента не найден' });
    return;
  }

  const [appointmentsResult, favoritesResult] = await Promise.all([
    ClientAppointment.deleteMany({ clientId: client._id }),
    ClientFavorite.deleteMany({ clientId: client._id }),
  ]);
  await ClientRegistration.deleteOne({ _id: client._id });

  res.json({
    ok: true,
    deleted: {
      appointments: appointmentsResult.deletedCount || 0,
      favorites: favoritesResult.deletedCount || 0,
      profile: 1,
    },
  });
});

app.get('/api/appointments/client', async (req, res) => {
  const { id, phone } = req.query;
  const client = await findClientForPublicProfile({ id, phone });

  if (!client) {
    res.status(404).json({ ok: false, message: 'Профиль клиента не найден' });
    return;
  }

  const appointments = await ClientAppointment.find({ clientId: client._id })
    .populate('clientId')
    .populate('salonId')
    .populate('masterId')
    .sort({ date: 1, time: 1, createdAt: -1 })
    .lean();
  const normalizedAppointments = sortNormalizedAppointments(
    await Promise.all(appointments.map(normalizeClientAppointment)),
  );
  const activeAppointments = normalizedAppointments.filter((item) => item.group === 'active');
  const historyAppointments = normalizedAppointments.filter((item) => item.group === 'history');
  const confirmedCount = activeAppointments.filter((item) => item.status === 'confirmed').length;
  const totalAmount = activeAppointments.reduce((sum, item) => sum + parseMoneyAmount(item.price), 0);

  res.json({
    ok: true,
    appointments: normalizedAppointments,
    client: normalizeClientProfile(await withSignedMemberUrls(normalizeMember('client', client, true))),
    nextAppointment: activeAppointments[0] || null,
    stats: {
      active: activeAppointments.length,
      confirmed: confirmedCount,
      history: historyAppointments.length,
      totalAmount,
    },
  });
});

app.get('/api/appointments/partner', async (req, res) => {
  const { id, phone, role } = req.query;
  const partner = await findPartnerForPublicProfile({ id, phone, role });
  if (!partner) {
    res.status(404).json({ ok: false, message: 'Профиль партнёра не найден' });
    return;
  }

  const relationField = role === 'salon' ? 'salonId' : 'masterId';
  const [appointments, salonMasters] = await Promise.all([
    ClientAppointment.find({ [relationField]: partner._id })
      .populate('clientId')
      .populate('salonId')
      .populate('masterId')
      .sort({ date: 1, time: 1, createdAt: -1 })
      .lean(),
    role === 'salon'
      ? MasterRegistration.find({
          accountStatus: { $ne: 'disabled' },
          salonId: partner._id,
        })
          .sort({ createdAt: 1 })
          .lean()
      : [],
  ]);
  const normalizedAppointments = sortNormalizedAppointments(
    await Promise.all(appointments.map(normalizeClientAppointment)),
  );
  const activeAppointments = normalizedAppointments.filter((item) => item.group === 'active');
  const historyAppointments = normalizedAppointments.filter((item) => item.group === 'history');

  res.json({
    ok: true,
    appointments: normalizedAppointments,
    masters: await Promise.all(salonMasters.map(normalizePublicMaster)),
    partner: normalizePartnerProfile(role, partner),
    stats: {
      active: activeAppointments.length,
      confirmed: activeAppointments.filter((item) => item.status === 'confirmed').length,
      history: historyAppointments.length,
      today: activeAppointments.filter((item) => item.date === getAlmatyDateKey()).length,
    },
  });
});

app.get('/api/appointments/availability', async (req, res) => {
  const { date, masterId, masterName } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || '')) || (!masterId && !masterName)) {
    res.status(400).json({ ok: false, message: 'Не указаны мастер или дата' });
    return;
  }

  const query = {
    date,
    status: { $in: ['pending', 'confirmed'] },
  };
  if (mongoose.isValidObjectId(masterId)) query.masterId = masterId;
  else query.masterName = String(masterName || '').trim();

  const appointments = await ClientAppointment.find(query).select('time').lean();
  res.json({
    bookedTimes: [...new Set(appointments.map((item) => item.time).filter(Boolean))],
    date,
    ok: true,
  });
});

app.post('/api/appointments/client', async (req, res) => {
  const {
    clientId,
    date,
    duration = '',
    image = '',
    masterId,
    masterName = '',
    notes = '',
    phone,
    price = '',
    salonId,
    salonName = '',
    serviceName,
    time,
  } = req.body || {};

  if (!serviceName?.trim() || !date || !time) {
    res.status(400).json({ ok: false, message: 'Выберите услугу, дату и время' });
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ ok: false, message: 'Неверный формат даты или времени' });
    return;
  }

  const client = await findClientForPublicProfile({ id: clientId, phone });
  if (!client || client.accountStatus === 'disabled') {
    res.status(404).json({ ok: false, message: 'Профиль клиента не найден или отключен' });
    return;
  }

  const resolvedMasterId = mongoose.isValidObjectId(masterId) ? masterId : null;
  const resolvedSalonId = mongoose.isValidObjectId(salonId) ? salonId : null;

  if (resolvedMasterId) {
    const master = await MasterRegistration.findOne({
      _id: resolvedMasterId,
      accountStatus: { $ne: 'disabled' },
    })
      .select('salonId status')
      .lean();
    const belongsToSelectedSalon =
      master?.salonId && resolvedSalonId && String(master.salonId) === String(resolvedSalonId);
    if (!master || (master.status !== 'approved' && !belongsToSelectedSalon)) {
      res.status(404).json({ ok: false, message: 'Мастер не найден или ещё не одобрен' });
      return;
    }
  }

  if (resolvedSalonId) {
    const salonExists = await SalonRegistration.exists({
      _id: resolvedSalonId,
      accountStatus: { $ne: 'disabled' },
      status: 'approved',
    });
    if (!salonExists) {
      res.status(404).json({ ok: false, message: 'Салон не найден или ещё не одобрен' });
      return;
    }
  }

  const activeStatuses = ['pending', 'confirmed'];
  const clientConflict = await ClientAppointment.exists({
    clientId: client._id,
    date,
    status: { $in: activeStatuses },
    time,
  });
  if (clientConflict) {
    res.status(409).json({ ok: false, message: 'У вас уже есть запись на это время' });
    return;
  }

  if (resolvedMasterId || masterName?.trim()) {
    const masterConflict = await ClientAppointment.exists({
      date,
      ...(resolvedMasterId
        ? { masterId: resolvedMasterId }
        : { masterName: String(masterName).trim() }),
      status: { $in: activeStatuses },
      time,
    });
    if (masterConflict) {
      res.status(409).json({ ok: false, message: 'Это время уже занято. Выберите другое' });
      return;
    }
  }

  const appointment = await ClientAppointment.create({
    clientId: client._id,
    date,
    duration: String(duration).slice(0, 80),
    image: String(image).slice(0, 2000),
    masterId: resolvedMasterId,
    masterName: String(masterName).trim().slice(0, 160),
    notes: String(notes).trim().slice(0, 1000),
    price: String(price).slice(0, 80),
    salonId: resolvedSalonId,
    salonName: String(salonName).trim().slice(0, 160),
    serviceName: String(serviceName).trim().slice(0, 200),
    status: 'confirmed',
    time,
  });

  const populated = await ClientAppointment.findById(appointment._id)
    .populate('salonId')
    .populate('masterId')
    .lean();

  res.status(201).json({
    appointment: await normalizeClientAppointment(populated),
    ok: true,
  });
});

app.get('/api/favorites/client', async (req, res) => {
  const { id, phone } = req.query;
  const client = await findClientForPublicProfile({ id, phone });

  if (!client) {
    res.status(404).json({ ok: false, message: 'Профиль клиента не найден' });
    return;
  }

  const favorites = await ClientFavorite.find({ clientId: client._id }).sort({ createdAt: -1 }).lean();

  res.json({
    ok: true,
    favorites: favorites.map(normalizeClientFavorite),
  });
});

app.patch('/api/favorites/client', async (req, res) => {
  const { clientId, phone, snapshot = {}, targetId, targetType } = req.body || {};

  if (!targetId || !['master', 'salon'].includes(targetType)) {
    res.status(400).json({ ok: false, message: 'Некорректный объект избранного' });
    return;
  }

  const client = await findClientForPublicProfile({ id: clientId, phone });
  if (!client) {
    res.status(404).json({ ok: false, message: 'Профиль клиента не найден' });
    return;
  }

  const query = { clientId: client._id, targetId, targetType };
  const existing = await ClientFavorite.findOne(query).lean();

  if (existing) {
    await ClientFavorite.deleteOne({ _id: existing._id });
    res.json({ favorite: normalizeClientFavorite(existing), isFavorite: false, ok: true });
    return;
  }

  const favorite = await ClientFavorite.create({
    ...query,
    snapshot: sanitizeFavoriteSnapshot(snapshot),
  });

  res.status(201).json({
    favorite: normalizeClientFavorite(favorite.toObject()),
    isFavorite: true,
    ok: true,
  });
});

app.post('/api/salon-registrations-json', async (req, res) => {
  const { images = {}, payload = {} } = req.body || {};
  const normalizedPhone = normalizeKazakhstanPhone(payload.phone);
  await assertUniquePartnerPhone(SalonRegistration, normalizedPhone, 'Салон');
  const uploaded = await uploadImagesFromJson(
    [
      images.ownerId ? { ...images.ownerId, field: 'ownerId' } : null,
      ...(images.licenses || []).map((image) => ({ ...image, field: 'licenses' })),
      ...(images.certificates || []).map((image) => ({ ...image, field: 'certificates' })),
      ...(images.photos || []).map((image) => ({ ...image, field: 'photos' })),
    ].filter(Boolean),
    'salons',
  );

  const registration = await SalonRegistration.create({
    ...payload,
    phone: normalizedPhone,
    documents: {
      ownerId: uploaded.find((file) => file.field === 'ownerId') || null,
      licenses: uploaded.filter((file) => file.field === 'licenses'),
      certificates: uploaded.filter((file) => file.field === 'certificates'),
      photos: uploaded.filter((file) => file.field === 'photos'),
    },
    status: 'pending_review',
  });

  res.status(201).json({ ok: true, id: registration._id, registration });
});

app.use((err, _req, res, _next) => {
  if (err.code === 11000 && err.keyPattern?.phone) {
    res.status(409).json({
      ok: false,
      message: 'Клиент с таким номером телефона уже зарегистрирован',
    });
    return;
  }

  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : err.statusCode || 400;
  res.status(status).json({
    ok: false,
    message:
      err.code === 'LIMIT_FILE_SIZE'
        ? `Файл слишком большой. Максимум ${maxImageSizeMb} MB.`
        : err.message || 'Upload error',
  });
});

async function multipartHandler(req, res, next) {
  uploadAny(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

function parsePayload(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Invalid JSON payload');
  }
}

function normalizeKazakhstanPhone(value = '') {
  const digits = String(value).replace(/\D/g, '');
  const withoutPrefix =
    digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
      ? digits.slice(1)
      : digits.slice(-10);

  if (withoutPrefix.length !== 10) {
    const error = new Error('Введите корректный номер телефона');
    error.statusCode = 400;
    throw error;
  }

  return `+7${withoutPrefix}`;
}

async function assertUniqueClientPhone(phone) {
  const existingClient = await ClientRegistration.exists({ phone });
  if (existingClient) {
    const error = new Error('Клиент с таким номером телефона уже зарегистрирован');
    error.statusCode = 409;
    throw error;
  }
}

async function assertUniquePartnerPhone(model, phone, roleLabel) {
  const existingPartner = await model.exists({ phone });
  if (existingPartner) {
    const error = new Error(`${roleLabel} с таким номером уже зарегистрирован`);
    error.statusCode = 409;
    throw error;
  }
}

function createAdminToken() {
  return Buffer.from(`${process.env.ADMIN_PASSWORD}:${new Date().toISOString().slice(0, 10)}`).toString(
    'base64',
  );
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== createAdminToken()) {
    res.status(401).json({ ok: false, message: 'Требуется вход администратора' });
    return;
  }
  next();
}

function getApplicationModel(type) {
  if (type === 'master') return MasterRegistration;
  if (type === 'salon') return SalonRegistration;
  return null;
}

function getMemberModel(type) {
  if (type === 'client') return ClientRegistration;
  if (type === 'master') return MasterRegistration;
  if (type === 'salon') return SalonRegistration;
  return null;
}

function sanitizeApplicationUpdate(type, body) {
  const pickString = (key) => (typeof body[key] === 'string' ? body[key].trim() : undefined);
  const update = {};

  if (type === 'master') {
    [
      'fullName',
      'city',
      'phone',
      'birthDate',
      'gender',
      'experience',
      'about',
      'portfolio',
    ].forEach((key) => {
      const value = pickString(key);
      if (value !== undefined) update[key] = value;
    });

    if (body.documents && typeof body.documents === 'object') {
      update.documents = {
        id: sanitizeImage(body.documents.id),
        certificates: sanitizeImages(body.documents.certificates),
        diplomas: sanitizeImages(body.documents.diplomas),
        licenses: sanitizeImages(body.documents.licenses),
      };
    }

    return update;
  }

  [
    'salonName',
    'ownerName',
    'city',
    'phone',
    'website',
    'legalName',
    'address',
    'workDays',
    'openTime',
    'closeTime',
    'description',
  ].forEach((key) => {
    const value = pickString(key);
    if (value !== undefined) update[key] = value;
  });

  if (body.documents && typeof body.documents === 'object') {
    update.documents = {
      ownerId: sanitizeImage(body.documents.ownerId),
      licenses: sanitizeImages(body.documents.licenses),
      certificates: sanitizeImages(body.documents.certificates),
      photos: sanitizeImages(body.documents.photos),
    };
  }

  return update;
}

function sanitizeImages(files) {
  return Array.isArray(files) ? files.map(sanitizeImage).filter(Boolean) : [];
}

function sanitizeImage(file) {
  if (!file || typeof file !== 'object' || !file.key) return null;
  return {
    contentType: file.contentType,
    field: file.field,
    key: file.key,
    originalName: file.originalName,
    size: file.size,
    url: file.url,
  };
}

function normalizeApplication(type, item, detailed = false) {
  const base = {
    id: String(item._id),
    type,
    typeLabel: type === 'master' ? 'Мастер' : 'Салон',
    title: type === 'master' ? item.fullName : item.salonName,
    subtitle: type === 'master' ? item.workFormat : item.ownerName,
    city: item.city,
    phone: item.phone,
    status: item.status,
    accountStatus: item.accountStatus || 'active',
    adminComment: item.adminComment || '',
    createdAt: item.createdAt,
    reviewedAt: item.reviewedAt,
  };

  if (!detailed) return base;

  if (type === 'master') {
    return {
      ...base,
      birthDate: item.birthDate,
      gender: item.gender,
      experience: item.experience,
      workFormat: item.workFormat,
      about: item.about,
      portfolio: item.portfolio,
      agreement: item.agreement,
      personalData: item.personalData,
      documents: item.documents || {},
    };
  }

  return {
    ...base,
    website: item.website,
    legalName: item.legalName,
    address: item.address,
    workDays: item.workDays,
    openTime: item.openTime,
    closeTime: item.closeTime,
    description: item.description,
    documents: item.documents || {},
  };
}

function normalizeMember(type, item, detailed = false) {
  const titleByType = {
    client: item.fullName,
    master: item.fullName,
    salon: item.salonName,
  };
  const subtitleByType = {
    client: item.phone,
    master: item.experience,
    salon: item.ownerName,
  };
  const labelByType = {
    client: 'Клиент',
    master: 'Мастер',
    salon: 'Салон',
  };

  const base = {
    id: String(item._id),
    type,
    typeLabel: labelByType[type],
    title: titleByType[type],
    subtitle: subtitleByType[type],
    city: item.city,
    phone: item.phone,
    status: item.status,
    accountStatus: item.accountStatus || 'active',
    createdAt: item.createdAt,
    reviewedAt: item.reviewedAt,
  };

  if (!detailed) return base;

  if (type === 'client') {
    return {
      ...base,
      birthDate: item.birthDate,
      gender: item.gender,
      photos: item.photos || {},
    };
  }

  if (type === 'master') {
    return {
      ...base,
      birthDate: item.birthDate,
      gender: item.gender,
      experience: item.experience,
      about: item.about,
      portfolio: item.portfolio,
      agreement: item.agreement,
      personalData: item.personalData,
      documents: item.documents || {},
    };
  }

  return {
    ...base,
    ownerName: item.ownerName,
    website: item.website,
    legalName: item.legalName,
    address: item.address,
    workDays: item.workDays,
    openTime: item.openTime,
    closeTime: item.closeTime,
    description: item.description,
    documents: item.documents || {},
  };
}

async function normalizePublicMaster(item) {
  return {
    id: String(item._id),
    city: item.city || '',
    experience: item.experience || '',
    name: item.fullName,
    phone: item.phone || '',
    price: 'от 10 000 ₸',
    rating: '4.9',
    salonId: item.salonId ? String(item.salonId) : '',
    specialty: item.workFormat || item.about || 'Мастер красоты',
    status: item.status || 'pending_review',
    type: 'master',
  };
}

async function normalizePublicSalon(item) {
  const signImage = createImageSigner();
  const photos = await Promise.all(((item.documents || {}).photos || []).map(signImage));
  const photoUrls = photos.map((photo) => photo.signedUrl || photo.url).filter(Boolean);
  const attachedMasters = await MasterRegistration.find({
    accountStatus: { $ne: 'disabled' },
    salonId: item._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    id: String(item._id),
    address: item.address || '',
    city: item.city || '',
    closeTime: item.closeTime || '',
    description: item.description || '',
    image: photoUrls[0] || '',
    masters: await Promise.all(attachedMasters.map(normalizePublicMaster)),
    name: item.salonName,
    openTime: item.openTime || '',
    phone: item.phone || '',
    photos: photoUrls,
    rating: '4.9',
    tags: 'Салон красоты • SPA',
    type: 'salon',
    workDays: item.workDays || '',
  };
}

function normalizeClientProfile(member) {
  const mainPhoto = member.photos?.main;
  const extraPhotos = member.photos?.extra || [];

  return {
    id: member.id,
    accountStatus: member.accountStatus,
    avatar: mainPhoto?.signedUrl || mainPhoto?.url || '',
    birthDate: member.birthDate || '',
    city: member.city || '',
    createdAt: member.createdAt,
    extraPhotos: extraPhotos.map((photo) => photo.signedUrl || photo.url).filter(Boolean),
    fullName: member.title || '',
    gender: member.gender || '',
    phone: member.phone || '',
    role: member.typeLabel || 'Клиент',
    status: member.status || '',
  };
}

async function normalizeClientAppointment(item) {
  const client = item.clientId && typeof item.clientId === 'object' ? item.clientId : null;
  const salon = item.salonId && typeof item.salonId === 'object' ? item.salonId : null;
  const master = item.masterId && typeof item.masterId === 'object' ? item.masterId : null;
  const salonPhotos = salon?.documents?.photos || [];
  const signImage = createImageSigner();
  const signedPhoto = salonPhotos[0] ? await signImage(salonPhotos[0]) : null;
  const statusMeta = getAppointmentStatusMeta(item.status, item.date, item.time);

  return {
    id: String(item._id),
    client: client
      ? {
          id: String(client._id),
          name: client.fullName || '',
          phone: client.phone || '',
        }
      : null,
    date: item.date,
    duration: item.duration || '',
    group: statusMeta.group,
    image: signedPhoto?.signedUrl || signedPhoto?.url || item.image || '',
    master: item.masterName || master?.fullName || '',
    masterId: master?._id ? String(master._id) : item.masterId ? String(item.masterId) : '',
    notes: item.notes || '',
    price: item.price || '',
    salon: salon ? await normalizePublicSalon(salon) : null,
    place: item.salonName || salon?.salonName || 'Салон',
    service: item.serviceName,
    status: item.status,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    time: item.time,
  };
}

function getAppointmentStatusMeta(status, date, time) {
  const statuses = {
    cancelled: { group: 'history', label: 'Отменено', tone: 'pink' },
    completed: { group: 'history', label: 'Завершено', tone: 'green' },
    confirmed: { group: 'active', label: 'Подтверждено', tone: 'green' },
    pending: { group: 'active', label: 'Ожидает', tone: 'gold' },
  };

  if (['pending', 'confirmed'].includes(status) && date && time) {
    const appointmentTime = new Date(`${date}T${time}:00+05:00`).getTime();
    if (Number.isFinite(appointmentTime) && appointmentTime < Date.now()) {
      return { group: 'history', label: 'Прошло', tone: 'green' };
    }
  }

  return statuses[status] || { group: 'active', label: 'Активно', tone: 'pink' };
}

async function findClientForPublicProfile({ id, phone } = {}) {
  if (!id && !phone) return null;

  const query = {};

  if (id) {
    if (!mongoose.isValidObjectId(id)) return null;
    query._id = id;
  } else if (phone) {
    query.phone = normalizeKazakhstanPhone(phone);
  }

  return ClientRegistration.findOne(query).sort({ createdAt: -1 }).lean();
}

async function findPartnerForPublicProfile({ id, phone, role } = {}) {
  if (!['master', 'salon'].includes(role) || (!id && !phone)) return null;

  const model = role === 'salon' ? SalonRegistration : MasterRegistration;
  const query = { accountStatus: { $ne: 'disabled' } };

  if (id) {
    if (!mongoose.isValidObjectId(id)) return null;
    query._id = id;
  } else {
    query.phone = normalizeKazakhstanPhone(phone);
  }

  return model.findOne(query).sort({ createdAt: -1 }).lean();
}

function normalizePartnerProfile(role, partner) {
  return {
    id: String(partner._id),
    accountStatus: partner.accountStatus || 'active',
    address: partner.address || '',
    city: partner.city || '',
    createdAt: partner.createdAt,
    name: role === 'salon' ? partner.salonName : partner.fullName,
    phone: partner.phone || '',
    role,
    roleLabel: role === 'salon' ? 'Салон' : 'Мастер',
    status: partner.status || 'pending_review',
    workDays: partner.workDays || '',
    openTime: partner.openTime || '',
    closeTime: partner.closeTime || '',
  };
}

function parseMoneyAmount(value = '') {
  const amount = Number(String(value).replace(/[^\d]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}

function sortNormalizedAppointments(appointments) {
  return appointments.sort((left, right) => {
    if (left.group !== right.group) return left.group === 'active' ? -1 : 1;
    const leftKey = `${left.date || ''}T${left.time || ''}`;
    const rightKey = `${right.date || ''}T${right.time || ''}`;
    return left.group === 'active'
      ? leftKey.localeCompare(rightKey)
      : rightKey.localeCompare(leftKey);
  });
}

function getAlmatyDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Almaty',
    year: 'numeric',
  }).format(new Date());
}

function normalizeClientFavorite(item) {
  return {
    id: String(item._id),
    createdAt: item.createdAt,
    item: item.snapshot || {},
    targetId: item.targetId,
    targetType: item.targetType,
  };
}

function sanitizeFavoriteSnapshot(snapshot) {
  const allowedKeys = [
    'address',
    'city',
    'distance',
    'district',
    'image',
    'kind',
    'name',
    'photos',
    'price',
    'rating',
    'ratingNumber',
    'scheduleTitle',
    'serviceGroup',
    'slots',
    'specialty',
    'status',
    'tags',
  ];
  const clean = {};

  allowedKeys.forEach((key) => {
    const value = snapshot[key];
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      clean[key] = value.filter((item) => typeof item === 'string');
      return;
    }
    if (['string', 'number', 'boolean'].includes(typeof value)) clean[key] = value;
  });

  return clean;
}

function buildStats(applications) {
  return {
    total: applications.length,
    pending: applications.filter((item) => item.status === 'pending_review').length,
    approved: applications.filter((item) => item.status === 'approved').length,
    rejected: applications.filter((item) => item.status === 'rejected').length,
    masters: applications.filter((item) => item.type === 'master').length,
    salons: applications.filter((item) => item.type === 'salon').length,
  };
}

function buildMemberStats(members) {
  return {
    total: members.length,
    active: members.filter((item) => item.accountStatus === 'active').length,
    disabled: members.filter((item) => item.accountStatus === 'disabled').length,
  };
}

async function withSignedDocumentUrls(application) {
  const signImage = async (file) => {
    if (!file?.key) return file;
    return {
      ...file,
      signedUrl: await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: file.key,
        }),
        { expiresIn: 60 * 15 },
      ),
    };
  };

  if (application.type === 'master') {
    const documents = application.documents || {};
    return {
      ...application,
      documents: {
        id: documents.id ? await signImage(documents.id) : null,
        certificates: await Promise.all((documents.certificates || []).map(signImage)),
        diplomas: await Promise.all((documents.diplomas || []).map(signImage)),
        licenses: await Promise.all((documents.licenses || []).map(signImage)),
      },
    };
  }

  const documents = application.documents || {};
  return {
    ...application,
    documents: {
      ownerId: documents.ownerId ? await signImage(documents.ownerId) : null,
      licenses: await Promise.all((documents.licenses || []).map(signImage)),
      certificates: await Promise.all((documents.certificates || []).map(signImage)),
      photos: await Promise.all((documents.photos || []).map(signImage)),
    },
  };
}

async function withSignedMemberUrls(member) {
  if (member.type === 'client') {
    const photos = member.photos || {};
    const signImage = createImageSigner();

    return {
      ...member,
      photos: {
        main: photos.main ? await signImage(photos.main) : null,
        extra: await Promise.all((photos.extra || []).map(signImage)),
      },
    };
  }

  return withSignedDocumentUrls(member);
}

function createImageSigner() {
  return async (file) => {
    if (!file?.key) return file;
    return {
      ...file,
      signedUrl: await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: file.key,
        }),
        { expiresIn: 60 * 15 },
      ),
    };
  };
}

async function uploadImages(files, folder) {
  return Promise.all(
    files.map(async (file) => {
      const compressed = await sharp(file.buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 82,
          mozjpeg: true,
        })
        .toBuffer();

      const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.jpg`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: compressed,
          ContentType: 'image/jpeg',
        }),
      );

      return {
        field: file.fieldname,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key,
        originalName: file.originalname,
        size: compressed.length,
        contentType: 'image/jpeg',
      };
    }),
  );
}

async function uploadImagesFromJson(images, folder) {
  return Promise.all(
    images.map(async (image) => {
      if (!image.base64) {
        throw new Error('Image payload is missing base64 data');
      }

      const buffer = Buffer.from(image.base64, 'base64');
      if (buffer.length > maxImageSizeMb * 1024 * 1024) {
        const error = new Error(`Файл слишком большой. Максимум ${maxImageSizeMb} MB.`);
        error.code = 'LIMIT_FILE_SIZE';
        throw error;
      }

      const compressed = await sharp(buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 82,
          mozjpeg: true,
        })
        .toBuffer();

      const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.jpg`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: compressed,
          ContentType: 'image/jpeg',
        }),
      );

      return {
        field: image.field,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key,
        originalName: image.name,
        size: compressed.length,
        contentType: 'image/jpeg',
      };
    }),
  );
}

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`XSIZE Partner API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
