/**
 * Togetherness — English and Arabic copy.
 * Arabic: human, gentle, culturally appropriate (Kuwait / Arab region).
 */

export type Locale = 'en' | 'ar';

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Welcome
    'welcome.headline': "You're welcome here",
    'welcome.supporting': "Connect when you're ready. A calm space to be with others.",
    'welcome.registrationBenefit': 'Creating an account lets you view and enroll in support groups.',
    'welcome.cta.createAccount': 'Create account',
    'welcome.cta.reassurance': "No pressure. You can explore at your pace.",
    'welcome.cta.signIn': 'Sign in',
    'welcome.language.english': 'English',
    'welcome.language.arabic': 'العربية',
    'welcome.language.hint': 'You can change this later in Profile.',
    'welcome.language.aria': 'Switch language',

    // Auth
    'auth.login': 'Sign in',
    'auth.loginTitle': 'Sign in',
    'auth.register': 'Create account',
    'auth.createAccountTitle': 'Create your account',
    'auth.createAccountButton': 'Create account',
    'auth.email': 'Email',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.noAccountRegister': "Don't have an account? Register",

    // Profile
    'profile.weeksOfConnection': 'weeks of connection',
    'profile.twoWeeksOfConnection': '2 weeks of connection',

    // Therabot (session suggestion chatbot)
    'therabot.title': 'Therabot',
    'therabot.prompt': "Type how you're feeling or what you're looking for. I'll suggest sessions that might fit—no pressure.",
    'therabot.placeholder': "e.g. anxiety, calm, men's space, in-person...",
    'therabot.suggest': 'Suggest sessions',
    'therabot.noResults': "No sessions match that right now. Try different words or browse the list below.",
    'therabot.suggestionsFor': 'Suggestions for you',
    'therabot.close': 'Close',

    // Session language (conducted in)
    'session.language': 'Language',
    'session.language.english': 'English',
    'session.language.arabic': 'Arabic',
    'session.language.bilingual': 'Bilingual',

    // Providers (card & detail labels)
    'providers.volunteerCoHost': 'Volunteer co-host',
    'providers.bio': 'Bio',
    'providers.sessionsTheyHost': 'Sessions they host',

    // Enrollment confirmation
    'enrollment.title': 'Thank you for your enrollment.',
    'enrollment.message': 'Session details and links will be sent to your email.',
    'enrollment.signedUpFor': 'You\'re signed up for "{sessionName}".',
    'enrollment.ok': 'OK',
    'enrollment.zoomLink': 'https://zoom.us/j/1234567890',
'enrollment.zoomLinkLabel': 'Join via Zoom',
  },
  ar: {
    // Welcome
    'welcome.headline': 'أهلاً بك هنا',
    'welcome.supporting': 'تواصل عندما تكون جاهزاً. مساحة هادئة لتكون مع الآخرين.',
    'welcome.registrationBenefit': 'إنشاء حساب يتيح لك عرض مجموعات الدعم والتسجيل فيها.',
    'welcome.cta.createAccount': 'إنشاء حساب',
    'welcome.cta.reassurance': 'لا يوجد أي ضغط. خذ وقتك كما تشاء.',
    'welcome.cta.signIn': 'تسجيل الدخول',
    'welcome.language.english': 'English',
    'welcome.language.arabic': 'العربية',
    'welcome.language.hint': 'يمكنك تغيير اللغة لاحقاً من الملف الشخصي.',
    'welcome.language.aria': 'تبديل اللغة',

    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.loginTitle': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'auth.createAccountTitle': 'إنشاء حسابك',
    'auth.createAccountButton': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.username': 'اسم المستخدم',
    'auth.password': 'كلمة المرور',
    'auth.noAccountRegister': 'ليس لديك حساب؟ سجّل الآن',

    // Tabs
    'tabs.home': 'الرئيسية',
    'tabs.providers': 'مقدمو الدعم',
    'tabs.profile': 'الملف الشخصي',

    // Home
    'home.title': 'مجموعات الدعم',
    'home.subtitle': 'اختر جلسة تناسبك. بدون ضغط—عندما تكون جاهزاً فقط.',
    'home.searchPlaceholder': 'البحث بالجلسة أو مقدم الدعم...',
    'home.empty': 'لا توجد جلسات تطابق البحث. جرّب كلمة أخرى.',
    'home.enrolled': 'مسجّلون',
    'home.enrolledOne': 'مسجّل',

    // Providers
    'providers.title': 'مقدمو الدعم',
    'providers.subtitle': 'الميسّرون والمشاركون الذين يقودون مجموعات الدعم. انقر للسيرة والجلسات.',
    'providers.viewBio': 'عرض السيرة والجلسات',
    'providers.volunteerCoHost': 'مشارك متطوع',
    'providers.bio': 'السيرة',
    'providers.sessionsTheyHost': 'الجلسات التي ييسّرها',

    // Profile
    'profile.youAreHere': 'أنت هنا باسم',
    'profile.sessionsAttended': 'الجلسات التي حضرتها',
    'profile.sessionsAttendedHint': 'مشاركتك مع الوقت. بدون ضغط—نحن هنا عندما تحضر.',
    'profile.commitment': 'الالتزام',
    'profile.weeksOfConnection': 'أسابيع من التواصل',
    'profile.twoWeeksOfConnection': 'أسبوعان من التواصل',
    'profile.commitmentHint': 'إشارة لطيفة للمشاركة. تشجيعية وليست مطالبة.',
    'profile.streak': 'السلسلة',
    'profile.streakUnlock': 'واظب الحضور عندما تستطيع. السلسلة تُفتح بعد 5 جلسات.',
    'profile.journeyBuilding': 'رحلتك تبني نفسها — كل خطوة تُحتسب.',
    'profile.upcomingSessions': 'الجلسات المسجّل فيها القادمة',
    'profile.noUpcoming': 'لا تسجيلات قادمة. سجّل من الرئيسية عندما تكون جاهزاً.',
    'profile.signOut': 'تسجيل الخروج',
    'profile.language': 'اللغة',
    'profile.languageHint': 'يمكن تغيير اللغة في أي وقت. لا يؤثر على حسابك أو بياناتك.',
    'profile.languageValue': 'English',
    'profile.languageValueAr': 'العربية',

    // Therabot
    'therabot.title': 'ثيرابوت',
    'therabot.prompt': 'اكتب كيف تشعر أو ما الذي تبحث عنه. سأقترح جلسات قد تناسبك—بدون ضغط.',
    'therabot.placeholder': 'مثلاً: قلق، هدوء، رجال، نساء، حضور...',
    'therabot.suggest': 'اقترح جلسات',
    'therabot.noResults': 'لا توجد جلسات تطابق ذلك حالياً. جرّب كلمات أخرى أو تصفّح القائمة.',
    'therabot.suggestionsFor': 'اقتراحات لك',
    'therabot.close': 'إغلاق',

    // Session language
    'session.language': 'لغة الجلسة',
    'session.language.english': 'إنجليزي',
    'session.language.arabic': 'عربي',
    'session.language.bilingual': 'ثنائي اللغة',

    // Enrollment confirmation
    'enrollment.title': 'شكراً لتسجيلك.',
    'enrollment.message': 'سيتم إرسال تفاصيل الجلسة والروابط إلى بريدك الإلكتروني.',
    'enrollment.signedUpFor': 'أنت مسجّل في "{sessionName}".',
    'enrollment.ok': 'موافق',
    'enrollment.zoomLink': 'https://zoom.us/j/1234567890',
    'enrollment.zoomLinkLabel': 'انضم عبر زوم',
  },
};

export function getTranslation(locale: Locale, key: string): string {
  const dict = translations[locale];
  return dict[key] ?? translations.en[key] ?? key;
}
