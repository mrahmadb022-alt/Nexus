// Strings for the nail-artist roadmap features, one group per feature. Same flat-key convention
// as translations.js and merged into it per language. Every key must exist in en, he and ar
// (translations.test.js checks this).

const general = {
  en: {
    'features.title': 'Features',
    'features.subtitle': 'Turn each tool on or off for your business. Changes apply right away.',
    'demo.badge': 'Demo mode, connects after backend setup',
  },
  he: {
    'features.title': 'תכונות',
    'features.subtitle': 'הפעלה או כיבוי של כל כלי בעסק. השינויים נכנסים לתוקף מיד.',
    'demo.badge': 'מצב הדגמה, יתחבר אחרי הגדרת השרת',
  },
  ar: {
    'features.title': 'الميزات',
    'features.subtitle': 'شغّل أو أوقف كل أداة لعملك. تُطبَّق التغييرات فوراً.',
    'demo.badge': 'وضع تجريبي، يتصل بعد إعداد الخادم',
  },
}

const contact = {
  en: {
    'feature.contact.name': 'Call & WhatsApp',
    'feature.contact.desc': 'Call and WhatsApp buttons on bookings and client details.',
    'contact.call': 'Call',
    'contact.whatsapp': 'WhatsApp',
    'contact.salon': 'Contact the salon',
    'contact.invalidPhone': "This number can't be dialed. Use an Israeli number like 054-123-4567.",
    'msg.confirmation': 'Hi {name}, your booking at {business} is confirmed: {service} on {date} at {time}.',
    'msg.clientToBusiness': 'Hi {business}, this is {name} about my {service} booking on {date} at {time}.',
  },
  he: {
    'feature.contact.name': 'חיוג ו-WhatsApp',
    'feature.contact.desc': 'כפתורי חיוג ו-WhatsApp בתורים ובפרטי הלקוח.',
    'contact.call': 'חיוג',
    'contact.whatsapp': 'WhatsApp',
    'contact.salon': 'יצירת קשר עם הסטודיו',
    'contact.invalidPhone': 'לא ניתן לחייג למספר הזה. יש להזין מספר ישראלי, למשל 054-123-4567.',
    'msg.confirmation': 'היי {name}, התור שלך אצל {business} אושר: {service} ב{date} בשעה {time}.',
    'msg.clientToBusiness': 'היי {business}, כאן {name} לגבי התור שלי ל{service} ב{date} בשעה {time}.',
  },
  ar: {
    'feature.contact.name': 'اتصال و WhatsApp',
    'feature.contact.desc': 'أزرار الاتصال و WhatsApp في الحجوزات وتفاصيل العميل.',
    'contact.call': 'اتصال',
    'contact.whatsapp': 'WhatsApp',
    'contact.salon': 'تواصل مع الصالون',
    'contact.invalidPhone': 'لا يمكن الاتصال بهذا الرقم. استخدم رقماً إسرائيلياً مثل 054-123-4567.',
    'msg.confirmation': 'مرحباً {name}، تم تأكيد حجزك لدى {business}: {service} يوم {date} الساعة {time}.',
    'msg.clientToBusiness': 'مرحباً {business}، معك {name} بخصوص حجزي لـ{service} يوم {date} الساعة {time}.',
  },
}

const GROUPS = [general, contact]

export const featureTranslations = Object.fromEntries(
  ['en', 'he', 'ar'].map((lang) => [lang, Object.assign({}, ...GROUPS.map((g) => g[lang]))]),
)
