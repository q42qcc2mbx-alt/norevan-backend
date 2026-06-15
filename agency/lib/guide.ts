// Content for the in-dashboard "how your website works" guide (DE/EN/AR).
// Section order is identical across languages so the icon list in AdminGuide
// lines up 1:1.

export interface GuideSection {
  title: string;
  body: string;
  where: string;
}

export interface GuideContent {
  title: string;
  subtitle: string;
  printLabel: string;
  whereLabel: string;
  sections: GuideSection[];
  outro: string;
}

export type GuideLang = "de" | "en" | "ar";

export const guide: Record<GuideLang, GuideContent> = {
  de: {
    title: "Anleitung: So funktioniert Ihre Website",
    subtitle: "Einfach erklärt, Schritt für Schritt. Tipp: oben rechts als PDF speichern.",
    printLabel: "Als PDF speichern",
    whereLabel: "Wo?",
    outro:
      "Geschafft! Sie kennen jetzt jeden Bereich. Wenn Sie nicht weiterwissen, hilft der KI-Assistent oben jederzeit.",
    sections: [
      {
        title: "Das Dashboard – Ihr Kommandozentrum",
        body: "Hier laufen alle Fäden zusammen: Analysen, Anfragen, Projekte und Nachrichten an einem Ort. Oben wählen Sie über die Reiter (Tabs) den jeweiligen Bereich.",
        where: "Tab: Übersicht",
      },
      {
        title: "So kommen Kunden zu Ihnen",
        body: "Besucher geben auf der Startseite ihre Web-Adresse ein und erhalten eine kostenlose KI-Analyse. Überzeugt das Ergebnis, fragen sie an. Die Seiten Lösungen und Mieten erklären Ihre Angebote.",
        where: "Öffentliche Website (Startseite, /analyse, /loesungen, /mieten)",
      },
      {
        title: "Analysen",
        body: "Jede durchgeführte Website-Analyse erscheint hier – mit Punktzahl und der E-Mail des Interessenten. Niedrige Punktzahlen sind heiße Kontakte: Da lohnt sich der erste Anruf.",
        where: "Tab: Analysen",
      },
      {
        title: "Statistik",
        body: "Zahlen auf einen Blick: Anfragen pro Woche, der Conversion-Funnel (Eingegangen → Kontaktiert → Kunde) und die Status-Verteilung. So sehen Sie sofort, was funktioniert.",
        where: "Tab: Statistik",
      },
      {
        title: "Anfragen & Chats",
        body: "Schreibt jemand über das Anfrage-Formular, antwortet zuerst die KI und hält den Kontakt warm. Sie übernehmen jederzeit und antworten selbst – ab dann ist die KI für diesen Chat stumm.",
        where: "Tabs: Anfragen und Anfrage-Chats",
      },
      {
        title: "Projekte",
        body: "Hier verwalten Sie laufende Kundenprojekte und deren Status (Analyse → Planung → Entwicklung → Testing → Fertig). Der Kunde sieht denselben Fortschritt in seinem Portal.",
        where: "Tab: Projekte",
      },
      {
        title: "Nachrichten senden",
        body: "Ihr direkter Draht zum Kunden. Was Sie hier schreiben, erscheint sofort im persönlichen Portal des Kunden – und kann ihn zusätzlich per E-Mail erreichen.",
        where: "Tab: Nachricht senden",
      },
      {
        title: "Der KI-Assistent",
        body: "Ihr persönlicher Helfer im Hintergrund. Fragen Sie ihn nach Texten, Ideen oder passenden Antworten für Kunden – er kennt Ihr Angebot und Ihre Preise.",
        where: "Tab: KI-Assistent",
      },
      {
        title: "Vorlagen (Angebot & Rechnung)",
        body: "Fertige Angebots- und Rechnungs-Vorlagen mit Anzahlung und Eigentumsvorbehalt. Das schützt Sie, falls ein Kunde nicht zahlt. Einfach kopieren, anpassen, senden.",
        where: "Tab: Vorlagen",
      },
      {
        title: "Sicherheit & Berichte",
        body: "Kunden sehen in ihrem Portal ihren Schutz-Status und können ihre Seite jederzeit live prüfen. Einmal im Monat geht automatisch ein Sicherheits-Report raus – sichtbarer Beweis Ihrer Arbeit.",
        where: "Kundenportal + automatischer Monats-Report",
      },
    ],
  },
  en: {
    title: "Guide: How your website works",
    subtitle: "Explained simply, step by step. Tip: save as PDF using the button top-right.",
    printLabel: "Save as PDF",
    whereLabel: "Where?",
    outro:
      "Done! You now know every area. If you ever get stuck, the AI assistant up top is always there to help.",
    sections: [
      {
        title: "The dashboard – your command center",
        body: "Everything comes together here: analyses, inquiries, projects and messages in one place. Pick an area using the tabs at the top.",
        where: "Tab: Overview",
      },
      {
        title: "How customers find you",
        body: "Visitors enter their web address on the homepage and get a free AI analysis. If it convinces them, they get in touch. The Solutions and Rent pages explain your offers.",
        where: "Public website (homepage, /analyse, /loesungen, /mieten)",
      },
      {
        title: "Analyses",
        body: "Every website analysis appears here – with a score and the prospect's e-mail. Low scores are hot leads: that's where the first call pays off.",
        where: "Tab: Analyses",
      },
      {
        title: "Statistics",
        body: "Numbers at a glance: inquiries per week, the conversion funnel (Received → Contacted → Customer) and the status breakdown. See instantly what works.",
        where: "Tab: Statistics",
      },
      {
        title: "Inquiries & chats",
        body: "When someone writes via the inquiry form, the AI replies first and keeps them engaged. You can take over and answer yourself any time – then the AI goes silent for that chat.",
        where: "Tabs: Inquiries and Inquiry chats",
      },
      {
        title: "Projects",
        body: "Manage ongoing client projects and their status here (Analysis → Planning → Development → Testing → Done). The customer sees the same progress in their portal.",
        where: "Tab: Projects",
      },
      {
        title: "Send messages",
        body: "Your direct line to the customer. Whatever you write here shows up instantly in the customer's personal portal – and can also reach them by e-mail.",
        where: "Tab: Send message",
      },
      {
        title: "The AI assistant",
        body: "Your personal helper in the background. Ask it for copy, ideas or the right answers for customers – it knows your offer and your prices.",
        where: "Tab: AI assistant",
      },
      {
        title: "Templates (quote & invoice)",
        body: "Ready-made quote and invoice templates with deposit and retention of title. This protects you if a customer doesn't pay. Just copy, adjust and send.",
        where: "Tab: Templates",
      },
      {
        title: "Security & reports",
        body: "Customers see their protection status in the portal and can scan their site live any time. Once a month a security report goes out automatically – visible proof of your work.",
        where: "Customer portal + automatic monthly report",
      },
    ],
  },
  ar: {
    title: "الدليل: كيف يعمل موقعك",
    subtitle: "شرح بسيط، خطوة بخطوة. نصيحة: احفظه كـ PDF عبر الزر في الأعلى.",
    printLabel: "حفظ كـ PDF",
    whereLabel: "أين؟",
    outro:
      "تمّ! أصبحت تعرف كل قسم الآن. وإن واجهتك أي صعوبة، فمساعد الذكاء الاصطناعي في الأعلى جاهز دائمًا للمساعدة.",
    sections: [
      {
        title: "لوحة التحكم – مركز قيادتك",
        body: "هنا يجتمع كل شيء: التحليلات والطلبات والمشاريع والرسائل في مكان واحد. اختر القسم من خلال التبويبات في الأعلى.",
        where: "تبويب: نظرة عامة",
      },
      {
        title: "كيف يصل إليك العملاء",
        body: "يُدخل الزائر عنوان موقعه في الصفحة الرئيسية فيحصل على تحليل مجاني بالذكاء الاصطناعي. وإذا أقنعته النتيجة، يتواصل معك. وصفحتا الحلول والإيجار تشرحان عروضك.",
        where: "الموقع العام (الرئيسية، ‎/analyse، ‎/loesungen، ‎/mieten)",
      },
      {
        title: "التحليلات",
        body: "يظهر هنا كل تحليل تمّ إجراؤه لموقع – مع الدرجة والبريد الإلكتروني للمهتم. الدرجات المنخفضة هي عملاء محتملون ساخنون: هنا يفيد الاتصال الأول.",
        where: "تبويب: التحليلات",
      },
      {
        title: "الإحصاءات",
        body: "أرقام بلمحة: الطلبات أسبوعيًا، ومسار التحويل (وارد → تم التواصل → عميل)، وتوزيع الحالات. لترى فورًا ما الذي ينجح.",
        where: "تبويب: الإحصاءات",
      },
      {
        title: "الطلبات والمحادثات",
        body: "عندما يكتب أحدهم عبر نموذج الطلب، يردّ الذكاء الاصطناعي أولًا ويُبقي التواصل حيًّا. يمكنك التدخّل والرد بنفسك في أي وقت – عندها يصمت الذكاء الاصطناعي لتلك المحادثة.",
        where: "تبويبات: الطلبات ومحادثات الطلبات",
      },
      {
        title: "المشاريع",
        body: "تدير هنا مشاريع العملاء الجارية وحالتها (تحليل → تخطيط → تطوير → اختبار → جاهز). ويرى العميل التقدّم نفسه في بوابته.",
        where: "تبويب: المشاريع",
      },
      {
        title: "إرسال الرسائل",
        body: "خطك المباشر مع العميل. ما تكتبه هنا يظهر فورًا في بوابة العميل الشخصية – ويمكن أن يصله أيضًا عبر البريد الإلكتروني.",
        where: "تبويب: إرسال رسالة",
      },
      {
        title: "مساعد الذكاء الاصطناعي",
        body: "مساعدك الشخصي في الخلفية. اسأله عن النصوص أو الأفكار أو الردود المناسبة للعملاء – فهو يعرف عرضك وأسعارك.",
        where: "تبويب: مساعد الذكاء الاصطناعي",
      },
      {
        title: "النماذج (عرض السعر والفاتورة)",
        body: "نماذج جاهزة لعروض الأسعار والفواتير مع دفعة مقدمة وحفظ الملكية. هذا يحميك إذا لم يدفع العميل. فقط انسخ وعدّل وأرسل.",
        where: "تبويب: النماذج",
      },
      {
        title: "الأمان والتقارير",
        body: "يرى العملاء حالة الحماية في بوابتهم ويمكنهم فحص موقعهم مباشرة في أي وقت. ومرة شهريًا يُرسَل تقرير أمان تلقائيًا – دليل مرئي على عملك.",
        where: "بوابة العميل + تقرير شهري تلقائي",
      },
    ],
  },
};
