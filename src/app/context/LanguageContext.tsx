import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'rw' | 'sw' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    rw: string;
    sw: string;
    fr: string;
  };
}

const translations: Translations = {
  // Header Navigation
  home: { en: 'Home', rw: 'Ahabanza', sw: 'Nyumbani', fr: 'Accueil' },
  services: { en: 'Services', rw: 'Serivisi', sw: 'Huduma', fr: 'Services' },
  properties: { en: 'Properties', rw: 'Imitungo', sw: 'Mali', fr: 'Propriétés' },
  about: { en: 'About', rw: 'Abo turi', sw: 'Kuhusu', fr: 'À propos' },
  contact: { en: 'Contact', rw: 'Twandikire', sw: 'Wasiliana', fr: 'Contact' },
  updates: { en: 'Updates', rw: 'Amakuru', sw: 'Taarifa', fr: 'Actualités' },
  login: { en: 'Login', rw: 'Injira', sw: 'Ingia', fr: 'Connexion' },
  joinUs: { en: 'Join Us', rw: 'Iyunge na twebwe', sw: 'Jiunge nasi', fr: 'Rejoignez-nous' },
  bsngCompany: { en: 'BSNG COMPANY', rw: 'IKIGO BSNG', sw: 'KAMPUNI YA BSNG', fr: 'COMPAGNIE BSNG' },

  // Property Page
  findYourDreamProperty: { en: 'Find Your Dream Property', rw: 'Shakisha Inzu Wabishaka', sw: 'Tafuta Mali Yako', fr: 'Trouvez Votre Propriété' },
  browseExclusiveCollection: { en: 'Browse our exclusive collection of properties for sale and rent', rw: 'Reba imitungo yacu yo kugurisha no gukodesha', sw: 'Angalia mkusanyiko wetu wa mali za kuuza na kupanga', fr: 'Parcourez notre collection de propriétés à vendre et à louer' },
  searchByLocation: { en: 'Search by location or property name...', rw: 'Shakisha ahantu cyangwa izina...', sw: 'Tafuta kwa eneo au jina...', fr: 'Rechercher par emplacement ou nom...' },
  previous: { en: 'Previous', rw: 'Inyuma', sw: 'Nyuma', fr: 'Précédent' },
  next: { en: 'Next', rw: 'Imbere', sw: 'Mbele', fr: 'Suivant' },
  all: { en: 'All', rw: 'Byose', sw: 'Zote', fr: 'Tout' },
  forSale: { en: 'For Sale', rw: 'Kugurisha', sw: 'Kuuza', fr: 'À Vendre' },
  forRent: { en: 'For Rent', rw: 'Gukodesha', sw: 'Kupanga', fr: 'À Louer' },
  availableProperties: { en: 'Available Properties', rw: 'Imitungo Iraboneka', sw: 'Mali Zinazopatikana', fr: 'Propriétés Disponibles' },
  propertiesFound: { en: 'properties found', rw: 'imitungo ibonetse', sw: 'mali zilizopatikana', fr: 'propriétés trouvées' },
  beds: { en: 'Beds', rw: 'Ibitanda', sw: 'Vitanda', fr: 'Lits' },
  baths: { en: 'Baths', rw: 'Ubwiherero', sw: 'Bafu', fr: 'Salles de bain' },
  viewDetails: { en: 'View Details', rw: 'Reba Birambuye', sw: 'Angalia Maelezo', fr: 'Voir Détails' },
  scheduleViewing: { en: 'Schedule Viewing', rw: 'Shirisha Gutegereza', sw: 'Ratiba Kuona', fr: 'Planifier Visite' },
  bookViewing: { en: 'Book Viewing', rw: 'Shira Gutegereza', sw: 'Weka Kuona', fr: 'Réserver Visite' },
  noPropertiesFound: { en: 'No properties found', rw: 'Nta mitungo ibonetse', sw: 'Hakuna mali zilizopatikana', fr: 'Aucune propriété trouvée' },

  // Payment
  payNow: { en: 'Pay Now', rw: 'Ishyura Nonaha', sw: 'Lipa Sasa', fr: 'Payer Maintenant' },
  selectPaymentMethod: { en: 'Select Payment Method', rw: 'Hitamo Uburyo bwo Kwishyura', sw: 'Chagua Njia ya Malipo', fr: 'Sélectionner Mode de Paiement' },
  mobileMoney: { en: 'Mobile Money (MoMo)', rw: 'Amafaranga ya Telefoni (MoMo)', sw: 'Pesa ya Simu (MoMo)', fr: 'Argent Mobile (MoMo)' },
  bankAccount: { en: 'Bank Account', rw: 'Konti ya Banki', sw: 'Akaunti ya Benki', fr: 'Compte Bancaire' },
  bankCard: { en: 'Credit / Debit Card', rw: 'Ikarita ya Banki', sw: 'Kadi ya Benki', fr: 'Carte de Crédit' },
  cash: { en: 'Cash', rw: 'Amafaranga', sw: 'Pesa Taslimu', fr: 'Espèces' },
  proceedToPayment: { en: 'Proceed to Payment', rw: 'Komeza Kwishyura', sw: 'Endelea Kulipa', fr: 'Procéder au Paiement' },

  // Common
  cancel: { en: 'Cancel', rw: 'Hagarika', sw: 'Ghairi', fr: 'Annuler' },
  submit: { en: 'Submit', rw: 'Ohereza', sw: 'Tuma', fr: 'Soumettre' },
  close: { en: 'Close', rw: 'Funga', sw: 'Funga', fr: 'Fermer' },
  name: { en: 'Name', rw: 'Izina', sw: 'Jina', fr: 'Nom' },
  email: { en: 'Email', rw: 'Imeli', sw: 'Barua pepe', fr: 'Email' },
  phone: { en: 'Phone', rw: 'Telefoni', sw: 'Simu', fr: 'Téléphone' },
  loading: { en: 'Loading...', rw: 'Birimo...', sw: 'Inapakia...', fr: 'Chargement...' },

  // Footer
  quickLinks: { en: 'Quick Links', rw: 'Ihuza ryihuse', sw: 'Viungo vya Haraka', fr: 'Liens Rapides' },
  privacyPolicy: { en: 'Privacy Policy', rw: 'Polisi y\'Ibanga', sw: 'Sera ya Faragha', fr: 'Politique de Confidentialité' },
  termsOfService: { en: 'Terms of Service', rw: 'Amategeko', sw: 'Masharti ya Huduma', fr: 'Conditions d\'Utilisation' },
  cookiePolicy: { en: 'Cookie Policy', rw: 'Polisi ya Kuki', sw: 'Sera ya Kuki', fr: 'Politique des Cookies' },
  rightsReserved: { en: 'All rights reserved', rw: 'Uburenganzira bwose burabitswe', sw: 'Haki zote zimehifadhiwa', fr: 'Tous droits réservés' },
  staffLogin: { en: 'Staff Login', rw: 'Kwinjira kw\'Abakozi', sw: 'Kuingia kwa Wafanyakazi', fr: 'Connexion Personnel' },
  residentialConstruction: { en: 'Residential Construction', rw: 'Ubwubatsi bw\'Inzu zo Guturamo', sw: 'Ujenzi wa Makazi', fr: 'Construction Résidentielle' },
  commercialConstruction: { en: 'Commercial Construction', rw: 'Ubwubatsi bw\'Inzu z\'Ubucuruzi', sw: 'Ujenzi wa Biashara', fr: 'Construction Commerciale' },

  // Top Bar
  giveUsACall: { en: 'Give us a call', rw: 'Hamagara Tuvugane', sw: 'Tupigie Simu', fr: 'Appelez-nous' },
  sendMailToUs: { en: 'Send mail to us', rw: 'Ohereza Imeli', sw: 'Tutume Barua Pepe', fr: 'Envoyez-nous un email' },
  visitOurOffice: { en: 'Visit our office at', rw: 'Sura ibiro byacu', sw: 'Tembelea ofisi yetu', fr: 'Visitez notre bureau à' },
  buildStrong: { en: 'Build Strong', rw: 'Kubaka Bikomeye', sw: 'Jenga Imara', fr: 'Construire Fort' },

  // Auth Pages (Login/Register)
  signInToDashboard: { en: 'Sign In to Dashboard', rw: 'Injira muri Dashboard', sw: 'Ingia kwenye Dashibodi', fr: 'Connectez-vous au Tableau de Bord' },
  signInWithGoogle: { en: 'Sign in with Google', rw: 'Injira ukoresheje Google', sw: 'Ingia na Google', fr: 'Se connecter avec Google' },
  signUpWithGoogle: { en: 'Sign up with Google', rw: 'Iyandikishe ukoresheje Google', sw: 'Jisajili na Google', fr: 'S\'inscrire avec Google' },
  emailAddress: { en: 'Email Address', rw: 'Aderesi ya Imeli', sw: 'Barua Pepe', fr: 'Adresse Email' },
  password: { en: 'Password', rw: 'Ijambo ry\'ibanga', sw: 'Nenosiri', fr: 'Mot de passe' },
  enterYourEmail: { en: 'Enter your email', rw: 'Andika imeli yawe', sw: 'Weka barua pepe yako', fr: 'Entrez votre email' },
  enterYourPassword: { en: 'Enter your password', rw: 'Andika ijambo ry\'ibanga', sw: 'Weka nenosiri lako', fr: 'Entrez votre mot de passe' },
  signIn: { en: 'Sign In', rw: 'Injira', sw: 'Ingia', fr: 'Se Connecter' },
  joinCommunity: { en: 'Join our community', rw: 'Iyandikishe iwacu', sw: 'Jiunge na jamii yetu', fr: 'Rejoignez notre communauté' },
  createAccount: { en: 'Create Account', rw: 'Fungura Konti', sw: 'Fungua Akaunti', fr: 'Créer un Compte' },
  fullName: { en: 'Full Name', rw: 'Amazina Yose', sw: 'Jina Kamili', fr: 'Nom Complet' },
  confirmPassword: { en: 'Confirm Password', rw: 'Emeza Ijambo ry\'ibanga', sw: 'Thibitisha Nenosiri', fr: 'Confirmer le Mot de Passe' },
  signUp: { en: 'Sign Up', rw: 'Iyandikishe', sw: 'Jisajili', fr: 'S\'inscrire' },
  alreadyHaveAccount: { en: 'Already have an account?', rw: 'Ufite konti?', sw: 'Je, una akaunti tayari?', fr: 'Vous avez déjà un compte ?' },
  backToHome: { en: 'Back to Home', rw: 'Subira Ahabanza', sw: 'Rudi Nyumbani', fr: 'Retour à l\'Accueil' },
  useCredentials: { en: 'Use your credentials to login. Default password:', rw: 'Koresha amakuru yawe kwinjira. Ijambo ry\'ibanga:', sw: 'Tumia sifa zako kuingia. Nenosiri la msingi:', fr: 'Utilisez vos identifiants pour vous connecter. Mot de passe par défaut :' },
  orContinueWith: { en: 'Or continue with', rw: 'Cyangwa ukomeze na', sw: 'Au endelea na', fr: 'Ou continuer avec' },

  // Landing Page
  heroTitle: { en: 'Building Your Future With Excellence', rw: 'Kubaka Ejo Hazaza Hanyu Neza', sw: 'Kujenga Baadaye Yako Kwa Ubora', fr: 'Bâtir Votre Avenir Avec Excellence' },
  heroSubtitle: { en: 'We deliver superior construction services with a commitment to quality, integrity, and innovation.', rw: 'Tuguha serivisi zidasanzwe z\'ubwubatsi twibanda ku buziranenge, ubunyangamugayo, no guhanga udushya.', sw: 'Tunatoa huduma bora za ujenzi kwa kujitolea kwa ubora, uadilifu, na uvumbuzi.', fr: 'Nous offrons des services de construction supérieurs avec un engagement envers la qualité, l\'intégrité et l\'innovation.' },
  ourServices: { en: 'Our Services', rw: 'Serivisi Zacu', sw: 'Huduma Zetu', fr: 'Nos Services' },
  viewProjects: { en: 'View Projects', rw: 'Reba Imishinga', sw: 'Angalia Miradi', fr: 'Voir Projets' },
  projectsCompleted: { en: 'Projects Completed', rw: 'Imishinga Yarangiye', sw: 'Miradi Imekamilika', fr: 'Projets Terminés' },
  happyClients: { en: 'Happy Clients', rw: 'Abakiriya Bishimye', sw: 'Wateja Wenye Furaha', fr: 'Clients Satisfaits' },
  teamMembers: { en: 'Team Members', rw: 'Abakozi', sw: 'Wanachama wa Timu', fr: 'Membres de l\'Équipe' },
  yearsExperience: { en: 'Years Experience', rw: 'Imyaka y\'Ubunararibonye', sw: 'Miaka ya Uzoefu', fr: 'Années d\'Expérience' },
  featuredProperties: { en: 'Featured Properties', rw: 'Imitungo Y\'indashyikirwa', sw: 'Mali Zinazoangaziwa', fr: 'Propriétés en Vedette' },
  whyChooseUs: { en: 'Why Choose Us', rw: 'Kuki Wahitamo Twebwe', sw: 'Kwa Nini Utuchague Siri', fr: 'Pourquoi Nous Choisir' },
  expertTeam: { en: 'Expert Team', rw: 'Ikipe y\'Inzobere', sw: 'Timu ya Wataalamu', fr: 'Équipe d\'Experts' },
  qualityWork: { en: 'Quality Work', rw: 'Akazi k\'Agaciro', sw: 'Kazi Bora', fr: 'Travail de Qualité' },
  onTimeDelivery: { en: 'On-Time Delivery', rw: 'Dusoza ku Gihe', sw: 'Utoaji kwa Wakati', fr: 'Livraison à Temps' },
  latestUpdates: { en: 'Latest Updates', rw: 'Amakuru Agezweho', sw: 'Taarifa za Hivi Punde', fr: 'Dernières Mises à Jour' },
  readMore: { en: 'Read More', rw: 'Soma Ibindi', sw: 'Soma Zaidi', fr: 'Lire Plus' },
  readyToStart: { en: 'Ready to start your project?', rw: 'Witeguye gutangira umushinga wawe?', sw: 'Je, uko tayari kuanza mradi wako?', fr: 'Prêt à démarrer votre projet ?' },
  contactUsMessage: { en: 'Contact us today for a free consultation and quote', rw: 'Twandikire uyu munsi dufatanye umushinga', sw: 'Wasiliana nasi leo kwa ushauri bure', fr: 'Contactez-nous aujourd\'hui pour une consultation gratuite' },
  dreamProperty: { en: 'Dream Property', rw: 'Inzu y\'Inzozi', sw: 'Mali ya Ndoto', fr: 'Propriété de Rêve' },
  availableCollection: { en: 'Available Collection', rw: 'Urutonde ruhari', sw: 'Mkusanyiko Unaopatikana', fr: 'Collection Disponible' },

  // About Page
  aboutBsng: { en: 'About BSNG Ltd', rw: 'Ibyerekeye BSNG Ltd', sw: 'Kuhusu BSNG Ltd', fr: 'À propos de BSNG Ltd' },
  ourStory: { en: 'Our Story', rw: 'Inkuru Yacu', sw: 'Hadithi Yetu', fr: 'Notre Histoire' },
  ourMission: { en: 'Our Mission', rw: 'Intego Yacu', sw: 'Dhamira Yetu', fr: 'Notre Mission' },
  ourVision: { en: 'Our Vision', rw: 'Icyerekezo Cyacu', sw: 'Maono Yetu', fr: 'Notre Vision' },
  coreValues: { en: 'Our Core Values', rw: 'Indangagaciro Zacu', sw: 'Maadili Yetu ya Msingi', fr: 'Nos Valeurs Fondamentales' },
  integrity: { en: 'Integrity', rw: 'Ubunyangamugayo', sw: 'Uadilifu', fr: 'Intégrité' },
  excellence: { en: 'Excellence', rw: 'Indashyikirwa', sw: 'Ubora', fr: 'Excellence' },
  collaboration: { en: 'Collaboration', rw: 'Gukorera Hamwe', sw: 'Ushirikiano', fr: 'Collaboration' },
  innovation: { en: 'Innovation', rw: 'Guhanga Udushya', sw: 'Uvumbuzi', fr: 'Innovation' },
  ourJourney: { en: 'Our Journey', rw: 'Urugendo Rwacu', sw: 'Safari Yetu', fr: 'Notre Parcours' },
  joinUsJourney: { en: 'Join Us on Our Journey', rw: 'Duaherekeze muri uru rugendo', sw: 'Ungana Nasi kwenye Safari Yetu', fr: 'Rejoignez-nous dans notre parcours' },
  getInTouch: { en: 'Get in Touch', rw: 'Twandikire', sw: 'Wasiliana Nasi', fr: 'Contactez-nous' },

  // Contact Page
  sendMessage: { en: 'Send Us a Message', rw: 'Ohereza Ubutumwa', sw: 'Tutumie Ujumbe', fr: 'Envoyez-nous un Message' },
  subject: { en: 'Subject', rw: 'Impamvu', sw: 'Mada', fr: 'Sujet' },
  message: { en: 'Message', rw: 'Ubutumwa', sw: 'Ujumbe', fr: 'Message' },
  businessHours: { en: 'Business Hours', rw: 'Amasaha y\'Akazi', sw: 'Saa za Kazi', fr: 'Heures de Bureau' },
  contactSuccess: { en: 'Thank you! Your message has been sent successfully.', rw: 'Murakoze! Ubutumwa bwanyu bwoherejwe neza.', sw: 'Asante! Ujumbe wako umetumwa kikamilifu.', fr: 'Merci ! Votre message a été envoyé avec succès.' },

  // Properties Pages
  purchaseThisProperty: { en: 'Purchase This Property', rw: 'Gura uyu mutungo', sw: 'Nunua Mali Hii', fr: 'Acheter cette Propriété' },
  rentThisProperty: { en: 'Rent This Property', rw: 'Kodesha uyu mutungo', sw: 'Panga Mali Hii', fr: 'Louer cette Propriété' },
  featuresAmenities: { en: 'Features & Amenities', rw: 'Ibiranga n\'Ibyiza', sw: 'Vipengele na Vistawishi', fr: 'Caractéristiques et Équipements' },
  description: { en: 'Description', rw: 'Ubusobanuro', sw: 'Maelezo', fr: 'Description' },
  propertyDetails: { en: 'Property Details', rw: 'Imiterere y\'Umutungo', sw: 'Maelezo ya Mali', fr: 'Détails de la Propriété' },
  loginToPay: { en: 'Login to Pay', rw: 'Injira kugira ngo Wishyure', sw: 'Ingia ili Kulipa', fr: 'Connectez-vous pour Payer' },
  paymentInitiated: { en: 'Payment Initiated!', rw: 'Kwishyura byatangiye!', sw: 'Malipo Yameanzishwa!', fr: 'Paiement Initié !' },
  requestSubmitted: { en: 'Request Submitted!', rw: 'Ubusabe bwoherejwe!', sw: 'Ombi Limewasilishwa!', fr: 'Demande Soumise !' },
  submitRequest: { en: 'Submit Request', rw: 'Ohereza Ubusabe', sw: 'Tuma Ombi', fr: 'Soumettre la Demande' },
  preferredDate: { en: 'Preferred Date', rw: 'Itariki wifuza', sw: 'Tarehe Inayopendekezwa', fr: 'Date Préférée' },
  messageOptional: { en: 'Message (Optional)', rw: 'Ubutumwa (Niba ubishaka)', sw: 'Ujumbe (Hiari)', fr: 'Message (Optionnel)' },
  paymentConfirmationMessage: { en: 'Our team will contact you shortly to confirm your request.', rw: 'Ikipe yacu irakuvugisha vuba kugira ngo yemeze ubusabe bwawe.', sw: 'Timu yetu itawasiliana nawe hivi karibuni ili kuthibitisha ombi lako.', fr: 'Notre équipe vous contactera sous peu pour confirmer votre demande.' },
  backToProperties: { en: 'Back to Properties', rw: 'Subira ku Mitungo', sw: 'Rudi kwa Mali', fr: 'Retour aux Propriétés' },

  sqft: { en: 'Sqft', rw: 'Kare', sw: 'Mita za Mraba', fr: 'Pieds carrés' },
  bedrooms: { en: 'Bedrooms', rw: 'Ibyumba byo kuraramo', sw: 'Vyumba vya kulala', fr: 'Chambres' },
  bathrooms: { en: 'Bathrooms', rw: 'Ubwiherero', sw: 'Bafu', fr: 'Salles de bain' },
  yearBuilt: { en: 'Year Built', rw: 'Umwaka yubakiwe', sw: 'Mwaka wa Ujenzi', fr: 'Année de Construction' },
  totalPrice: { en: 'Total Price', rw: 'Igiciro Cyose', sw: 'Bei Jumla', fr: 'Prix Total' },
  monthlyRent: { en: 'Monthly Rent', rw: 'Ubukode bwa Buri Kwezi', sw: 'Kodi ya Mwezi', fr: 'Loyer Mensuel' },
  loginToPayMessage: { en: 'You must be logged in to make a payment', rw: 'Ugomba kwinjira kugira ngo wishyure', sw: 'Lazima uingie ili kufanya malipo', fr: 'Vous devez être connecté pour effectuer un paiement' },
  propertyId: { en: 'Property ID', rw: 'Numero y\'Umutungo', sw: 'Kitambulisho cha Mali', fr: 'ID de Propriété' },
  parking: { en: 'Parking', rw: 'Parikingi', sw: 'Maegesho', fr: 'Parking' },
  perMonth: { en: '/mo', rw: '/ukwezi', sw: '/mwezi', fr: '/mois' },
  budgetFriendly: { en: 'Budget Friendly', rw: 'Ibiciro Byeza', sw: 'Bei Nafuu', fr: 'Prix Abordables' },
  fairPrices: { en: 'Fair Prices', rw: 'Ibiciro Bikwiye', sw: 'Bei ya Haki', fr: 'Prix Équitables' },

  typeLabel: { en: 'Type', rw: 'Ubwoko', sw: 'Aina', fr: 'Type' },
  plotsForSale: { en: 'Plots for Sale', rw: 'Ibibanza byo Kugurisha', sw: 'Viwanja vya Kuuza', fr: 'Terrains à Vendre' },
  housesForRent: { en: 'Houses for Rent', rw: 'Inzu zo Gukodesha', sw: 'Nyumba za Kupangisha', fr: 'Maisons à Louer' },
  housesForSale: { en: 'Houses for Sale', rw: 'Inzu zo Kugurisha', sw: 'Nyumba za Kuuza', fr: 'Maisons à Vendre' },
  upiLabel: { en: 'UPI', rw: 'UPI', sw: 'UPI', fr: 'UPI' },
  purchaseProperty: { en: 'Purchase Property', rw: 'Gura Umutungo', sw: 'Nunua Mali', fr: 'Acheter la Propriété' },
  rentProperty: { en: 'Rent Property', rw: 'Kodesha Umutungo', sw: 'Panga Mali', fr: 'Louer la Propriété' },
  payMomoMessage: { en: 'Pay using your mobile money account', rw: 'Ishyura ukoresheje Mobile Money', sw: 'Lipa kwa kutumia akaunti ya simu', fr: 'Payez avec votre compte Mobile Money' },
  payBankMessage: { en: 'Visa, Mastercard, or Bank Transfer', rw: 'Visa, Mastercard, cyangwa Kohereza Banki', sw: 'Visa, Mastercard, au Uhamisho wa Benki', fr: 'Visa, Mastercard ou Virement Bancaire' },
  payCashMessage: { en: 'Pay in cash at our office', rw: 'Ishyura amafaranga ku biro byacu', sw: 'Lipa pesa taslimu ofisini kwetu', fr: 'Payez en espèces à notre bureau' },

  momoPayment: { en: 'Mobile Money Payment', rw: 'Kwishyura Mobile Money', sw: 'Malipo ya Simu', fr: 'Paiement Mobile Money' },
  bankPayment: { en: 'Bank Transfer Payment', rw: 'Kwishyura Banki', sw: 'Malipo ya Benki', fr: 'Paiement Virement Bancaire' },
  cashPaymentDetails: { en: 'Cash Payment Details', rw: 'Birambuye ku Kwishyura Amafaranga', sw: 'Maelezo ya Malipo ya Taslimu', fr: 'Détails du Paiement en Espèces' },
  amountToPay: { en: 'Amount to Pay', rw: 'Amafaranga yo Kwishyura', sw: 'Kiasi cha Kulipa', fr: 'Montant à Payer' },
  mobileMoneyNumber: { en: 'Mobile Money Number', rw: 'Nimero ya Mobile Money', sw: 'Namba ya Simu', fr: 'Numéro Mobile Money' },
  cardNumber: { en: 'Card Number', rw: 'Nimero y\'Ikarita', sw: 'Namba ya Kadi', fr: 'Numéro de Carte' },
  expiryDate: { en: 'Expiry Date', rw: 'Itariki yo Guta Agaciro', sw: 'Tarehe ya Kuisha', fr: 'Date d\'Expiration' },
  cvv: { en: 'CVV', rw: 'CVV', sw: 'CVV', fr: 'CVV' },
  securedBy: { en: 'Secured by', rw: 'Bitekanye na', sw: 'Imelindwa na', fr: 'Sécurisé par' },
  cashPaymentInstructions: { en: 'Cash Payment Instructions', rw: 'Amabwiriza yo Kwishyura Amafaranga', sw: 'Maelekezo ya Malipo ya Taslimu', fr: 'Instructions de Paiement en Espèces' },
  visitOfficeAt: { en: 'Please visit our office at', rw: 'Nyamuneka sura ibiro byacu kuri', sw: 'Tafadhali tembelea ofisi yetu kwa', fr: 'Veuillez visiter notre bureau à' },
  officeHours: { en: 'Office Hours', rw: 'Amasaha y\'Akazi', sw: 'Saa za Ofisi', fr: 'Heures de Bureau' },
  officeHoursWeekdays: { en: 'Monday - Friday: 8:00 AM - 6:00 PM', rw: 'Kuwa Mbere - Kuwa Gatanu: 8:00 AM - 6:00 PM', sw: 'Jumatatu - Ijumaa: 8:00 AM - 6:00 PM', fr: 'Lundi - Vendredi : 08h00 - 18h00' },
  officeHoursSaturday: { en: 'Saturday: 9:00 AM - 2:00 PM', rw: 'Kuwa Gatandatu: 9:00 AM - 2:00 PM', sw: 'Jumamosi: 9:00 AM - 2:00 PM', fr: 'Samedi : 09h00 - 14h00' },
  officeHoursSunday: { en: 'Sunday: Closed', rw: 'Kuwa Cyumweru: Harafungwa', sw: 'Jumapili: Imefungwa', fr: 'Dimanche : Fermé' },

  selectSubject: { en: 'Select a subject', rw: 'Hitamo impamvu', sw: 'Chagua mada', fr: 'Sélectionnez un sujet' },
  subjectConstruction: { en: 'Construction Project', rw: 'Umushinga w\'Ubwubatsi', sw: 'Mradi wa Ujenzi', fr: 'Projet de Construction' },
  subjectSale: { en: 'Property for Sale', rw: 'Umutungo Ugurishwa', sw: 'Mali ya Kuuzwa', fr: 'Propriété à Vendre' },
  subjectRental: { en: 'Property Rental', rw: 'Umutungo Ukodeshwa', sw: 'Mali ya Kukodisha', fr: 'Location Immobilière' },
  subjectConsultation: { en: 'Consultation', rw: 'Ubugenzuzi', sw: 'Ushauri', fr: 'Consultation' },
  subjectOther: { en: 'Other', rw: 'Ibindi', sw: 'Nyingine', fr: 'Autre' },

  visitOfficeMessage: { en: "Stop by and let's discuss your project in person", rw: 'Nyamuneka tunyureho tuganire ku mushinga wawe imbonankubone', sw: 'Pita ofisini tujadili mradi wako ana kwa ana', fr: 'Passez nous voir et discutons de votre projet en personne' },

  referenceNumber: { en: 'Reference Number', rw: 'Nimero y\'Irangamuntu', sw: 'Namba ya Kumbukumbu', fr: 'Numéro de Référence' },

  paymentRequestSubmitted: { en: 'Your payment request has been submitted successfully.', rw: 'Ubusabe bwo kwishyura bwoherejwe neza.', sw: 'Ombi lako la malipo limewasilishwa kikamilifu.', fr: 'Votre demande de paiement a été soumise avec succès.' },
  // paymentConfirmationMessage removed as duplicate of line 151

  // Updates Page
  latestUpdatesNews: { en: 'Latest Updates & News', rw: 'Amakuru Agezweho', sw: 'Habari na Taarifa', fr: 'Dernières Mises à Jour et Actualités' },
  updatesDescription: { en: 'Stay informed with the latest news, projects, and announcements from BSNG Ltd', rw: 'Guma uzi amakuru agezweho, imishinga, n\'itangazo bya BSNG Ltd', sw: 'Pata habari mpya, miradi, na matangazo kutoka BSNG Ltd', fr: 'Restez informé des dernières nouvelles, projets et annonces de BSNG Ltd' },
  searchUpdates: { en: 'Search updates...', rw: 'Shakisha...', sw: 'Tafuta...', fr: 'Rechercher...' },
  noUpdatesFound: { en: 'No updates found', rw: 'Nta makuru yabonetse', sw: 'Hakuna taarifa iliyopatikana', fr: 'Aucune mise à jour trouvée' },
  adjustSearchCriteria: { en: 'Try adjusting your search or filter criteria', rw: 'Gerageza guhindura ibyo ushaka', sw: 'Jaribu kurekebisha utafutaji wako', fr: 'Essayez d\'ajuster vos critères de recherche' },
  categoryProjects: { en: 'Projects', rw: 'Imishinga', sw: 'Miradi', fr: 'Projets' },
  categoryAwards: { en: 'Awards', rw: 'Ibihembo', sw: 'Tuzo', fr: 'Récompenses' },
  categoryEvents: { en: 'Events', rw: 'Ibirori', sw: 'Matukio', fr: 'Événements' },
  categoryNews: { en: 'News', rw: 'Amakuru', sw: 'Habari', fr: 'Actualités' },
  categoryCompany: { en: 'Company', rw: 'Ikigo', sw: 'Kampuni', fr: 'Entreprise' },

  // Home Page Services Section
  constructionProjects: { en: 'Construction Projects', rw: 'Imishinga y\'Ubwubatsi', sw: 'Miradi ya Ujenzi', fr: 'Projets de Construction' },
  constructionProjectsDesc: { en: 'Full-service construction from residential to commercial buildings with quality assurance.', rw: 'Serivisi zuzuye z\'ubwubatsi kuva ku nzu zo guturamo kugeza ku commercial buildings n\'ubwishingizi bw\'ubuziranenge.', sw: 'Huduma kamili ya ujenzi kutoka makazi hadi majengo ya biashara na uhakikisho wa ubora.', fr: 'Construction complète, des bâtiments résidentiels aux commerciaux, avec assurance qualité.' },
  propertyDevelopment: { en: 'Property Development', rw: 'Iterambere ry\'Imitungo', sw: 'Maendeleo ya Mali', fr: 'Développement Immobilier' },
  propertyDevelopmentDesc: { en: 'Strategic property development and management services for maximum value.', rw: 'Serivisi z\'iterambere ry\'imitungo n\'imiyoborere zigamije kongera agaciro.', sw: 'Maendeleo ya kimkakati ya mali na huduma za usimamizi kwa thamani ya juu.', fr: 'Développement immobilier stratégique et services de gestion pour une valeur maximale.' },
  projectManagement: { en: 'Project Management', rw: 'Gucunga Imishinga', sw: 'Usimamizi wa Miradi', fr: 'Gestion de Projet' },
  projectManagementDesc: { en: 'Expert project management ensuring timely delivery and budget compliance.', rw: 'Ubuyobozi bw\'imishinga buhamye butanga ibisubizo ku gihe no kubahiriza ingengo y\'imari.', sw: 'Usimamizi wa kitaalam wa miradi unaohakikisha uwasilishaji kwa wakati na kufuata bajeti.', fr: 'Gestion de projet experte assurant une livraison à temps et le respect du budget.' },
  realEstateSales: { en: 'Real Estate Sales', rw: 'Kugurisha Imitungo', sw: 'Mauzo ya Mali Isiyohamishika', fr: 'Vente Immobilière' },
  realEstateSalesDesc: { en: 'Premium properties for sale with flexible payment plans and financing options.', rw: 'Imitungo myiza igurishwa hafi yanyu, ifite uburyo bwo kwishyura bworoshye n\'amahirwe yo kubona inguzanyo.', sw: 'Mali za hali ya juu zinazouzwa na mipango rahisi ya malipo na chaguzi za ufadhili.', fr: 'Propriétés haut de gamme à vendre avec des plans de paiement flexibles et options de financement.' },
  propertyRentals: { en: 'Property Rentals', rw: 'Gukodesha Imitungo', sw: 'Kupangisha Mali', fr: 'Location de Propriétés' },
  propertyRentalsDesc: { en: 'Quality rental properties in prime locations for residential and commercial use.', rw: 'Inzu zo gukodesha nziza, ziri ahantu heza, zigenewe guturamo no gukoreramo ubucuruzi.', sw: 'Mali bora za kupangisha katika maeneo muhimu kwa matumizi ya makazi na biashara.', fr: 'Propriétés locatives de qualité dans des emplacements privilégiés pour usage résidentiel et commercial.' },
  consultationServices: { en: 'Consultation Services', rw: 'Serivisi d\'Ubugenzuzi', sw: 'Huduma za Ushauri', fr: 'Services de Consultation' },
  consultationServicesDesc: { en: 'Professional consultation for construction, design, and property investment.', rw: 'Ubugenzuzi bwa kinyamwuga ku bwubatsi, igishushanyo mbonera, n\'ishoramari ry\'imitungo.', sw: 'Ushauri wa kitaalamu kwa ujenzi, muundo, na uwekezaji wa mali.', fr: 'Consultation professionnelle pour la construction, la conception et l\'investissement immobilier.' },

  residentialConstructionDesc: { en: 'Custom homes designed and built to your specifications with the highest quality standards.', rw: 'Inzu z\'imiturire zikoze kubisabwa n\'ubuziranenge buhanitse.', sw: 'Nyumba za makazi iliyoundwa na kujengwa kwa viwango vyako na ubora wa juu.', fr: 'Constructions résidentielles personnalisées conçues et construites selon vos spécifications avec les normes de qualité les plus élevées.' },
  commercialConstructionDesc: { en: 'Durable and functional commercial spaces that support your business growth and efficiency.', rw: 'Ahantu h\'ubucuruzi haramba kandi hakora neza hateza imbere ubucuruzi bwawe.', sw: 'Nafasi za biashara za kudumu na zinazofanya kazi zinazounga mkono ukuaji na ufanisi wa biashara yako.', fr: 'Espaces commerciaux durables et fonctionnels qui soutiennent la croissance et l\'efficacité de votre entreprise.' },
  renovationRemodelingDesc: { en: 'Transform your existing space with our expert renovation and remodeling services.', rw: 'Hindura aho uba cyangwa ukorera uhahe isura nshya hamwe na serivisi zacu z\'ivugurura.', sw: 'Badilisha nafasi yako iliyopo na huduma zetu za ukarabati na urekebishaji wa kitaalam.', fr: 'Transformez votre espace existant avec nos services experts de rénovation et de remodelage.' },
  subconstruction: { en: 'Subconstruction', rw: 'Ubwubatsi Buciriritse', sw: 'Ujenzi Mdogo', fr: 'Sous-construction' },
  subconstructionDesc: { en: 'Expert sub-contracting services for specialized construction phases and structural works.', rw: 'Serivisi z\'inzobere mu bwubatsi ku byiciro byihariye n\'imikorere y\'ubaka.', sw: 'Huduma za ujenzi mdogo kwa ajili ya awamu maalum za ujenzi na kazi za kimfumo.', fr: 'Services de sous-traitance experts pour les phases de construction spécialisées et les travaux structurels.' },
  brokerage: { en: 'Brokerage', rw: 'Ubuhuza mu bucuruzi', sw: 'Udalali', fr: 'Courtage' },
  brokerageDesc: { en: 'Professional brokerage services for large-scale property transactions and investment opportunities.', rw: 'Serivisi z\'ubunyamwuga mu buhuzabikorwa bw\'imitungo minini n\'ishoramari.', sw: 'Huduma za udalali wa kitaalamu kwa miamala mikubwa ya mali na fursa za uwekezaji.', fr: 'Services de courtage professionnels pour les transactions immobilières à grande échelle et les opportunités d\'investissement.' },

  // About Page Details
  coreValuesSubtitle: { en: 'The principles that guide everything we do', rw: 'Amahame atuyobora muri byose dukora', sw: 'Kanuni zinazoongoza kila tunachofanya', fr: 'Les principes qui guident tout ce que nous faisons' },
  integrityDesc: { en: 'We operate with transparency and honesty in all our dealings', rw: 'Dukorana umucyo n’ubunyangamugayo mu byo dukora byose', sw: 'Tunafanya kazi kwa uwazi na uaminifu katika shughuli zetu zote', fr: 'Nous opérons avec transparence et honnêteté dans toutes nos relations' },
  excellenceDesc: { en: 'We strive for the highest quality in every project we undertake', rw: 'Duharanira ubuziranenge buhanitse muri buri mushinga dukoze', sw: 'Tunajitahidi kwa ubora wa juu katika kila mradi tunaofanya', fr: 'Nous visons la plus haute qualité dans chaque projet que nous entreprenons' },
  collaborationDesc: { en: 'We work closely with clients and partners to achieve shared goals', rw: 'Dukorana bya hafi n’abakiriya n’abafatanyabikorwa kugira ngo tugere ku ntego duhuriyeho', sw: 'Tunafanya kazi kwa karibu na wateja na washirika kufikia malengo ya pamoja', fr: 'Nous travaillons en étroite collaboration avec les clients et les partenaires pour atteindre des objectifs communs' },
  innovationDesc: { en: 'We embrace new technologies and methods to deliver better results', rw: 'Dukoresha ikoranabuhanga n’uburyo bushya kugira ngo dutange ibisubizo byiza', sw: 'Tunakumbatia teknolojia na mbinu mpya ili kutoa matokeo bora', fr: 'Nous adoptons de nouvelles technologies et méthodes pour obtenir de meilleurs résultats' },

  ourJourneySubtitle: { en: "Key milestones in our company's growth", rw: "Intambwe z'ingenzi mu iterambere ry'ikigo cyacu", sw: "Hatua muhimu katika ukuaji wa kampuni yetu", fr: "Étapes clés de la croissance de notre entreprise" },
  companyFounded: { en: 'Company Founded', rw: 'Ikigo Cyashinzwe', sw: 'Kampuni Ilianzishwa', fr: 'Entreprise Fondée' },
  companyFoundedDesc: { en: 'BSNG Ltd established with a vision to transform construction', rw: 'BSNG Ltd yashinzwe ifite icyerekezo cyo guhindura ubwubatsi', sw: 'BSNG Ltd ilianzishwa na maono ya kubadilisha ujenzi', fr: 'BSNG Ltd créée avec une vision de transformer la construction' },
  projectsCompletedEvent: { en: '50 Projects Completed', rw: 'Imishinga 50 Yarangiye', sw: 'Miradi 50 Imekamilika', fr: '50 Projets Terminés' },
  projectsCompletedDesc: { en: 'Milestone achievement in residential construction', rw: 'Intambwe ikomeye mu bwubatsi bw\'inzu zo guturamo', sw: 'Mafanikio muhimu katika ujenzi wa makazi', fr: 'Réalisation marquante dans la construction résidentielle' },
  commercialExpansion: { en: 'Commercial Expansion', rw: 'Kwagura Ubucuruzi', sw: 'Upanuzi wa Biashara', fr: 'Expansion Commerciale' },
  commercialExpansionDesc: { en: 'Expanded services to include large commercial projects', rw: 'Serivisi zagutse zikubiyemo imishinga minini y\'ubucuruzi', sw: 'Huduma zilizopanuliwa kujumuisha miradi mikubwa ya biashara', fr: 'Services étendus pour inclure de grands projets commerciaux' },
  regionalLeader: { en: 'Regional Leader', rw: 'Ubuyobozi mu Karere', sw: 'Kiongozi wa Mkoa', fr: 'Leader Régional' },
  regionalLeaderDesc: { en: 'Recognized as a leading construction firm in the region', rw: 'Yemewe nka kompanyi y\'ubwubatsi iyoboye mu karere', sw: 'Inatambulika kama kampuni inayoongoza ya ujenzi katika mkoa', fr: 'Reconnue comme une entreprise de construction de premier plan dans la région' },
  sustainableFuture: { en: 'Sustainable Future', rw: 'Ejo Hazaza Harambye', sw: 'Baadaye Endelevu', fr: 'Avenir Durable' },
  sustainableFutureDesc: { en: 'Committed to green building and sustainable practices', rw: 'Twiyemeje kubaka bijyanye n\'ibidukikije n\'ikorabuhanga rirambye', sw: 'Kujitolea kwa ujenzi wa kijani na mazoea endelevu', fr: 'Engagé dans la construction écologique et les pratiques durables' },

  ourTeamByNumbers: { en: 'Our Team by Numbers', rw: 'Ikipe Yacu mu Mibare', sw: 'Timu Yetu kwa Nambari', fr: 'Notre Équipe en Chiffres' },
  teamSubtitle: { en: 'The people behind our success', rw: 'Abantu bari inyuma y\'intsinzi yacu', sw: 'Watu nyuma ya mafanikio yetu', fr: 'Les personnes derrière notre succès' },
  engineers: { en: 'Engineers', rw: 'Ba Enjeniyeri', sw: 'Wahandisi', fr: 'Ingénieurs' },
  skilledWorkers: { en: 'Skilled Workers', rw: 'Abakozi b\'Abanyamwuga', sw: 'Wafanyakazi Wenye Ujuzi', fr: 'Ouvriers Qualifiés' },
  supportStaff: { en: 'Support Staff', rw: 'Abakozi b\'Inkunga', sw: 'Wafanyakazi wa Msaada', fr: 'Personnel de Soutien' },

  aboutCtaText: { en: "Whether you're looking to build your dream home or develop a commercial property, we're here to help", rw: "Waba ushaka kubaka inzu y'inzozi zawe cyangwa gutunganya umutungo w'ubucuruzi, turi hano kugira ngo tugufashe", sw: "Kama unatafuta kujenga nyumba ya ndoto yako au kuendeleza mali ya biashara, tuko hapa kusaidia", fr: "Que vous cherchiez à construire la maison de vos rêves ou à développer une propriété commerciale, nous sommes là pour vous aider" },

  missionDesc: { en: "To deliver exceptional construction and property solutions that exceed our clients' expectations while building lasting relationships based on trust, quality, and innovation. We are committed to creating spaces that enhance lives and communities for generations to come.", rw: "Gutanga ibisubizo by'ubwubatsi n'imitungo birenze ibyo abakiriya bacu biteze, twubaka umubano urambye ushingiye ku kwizerana, ubuziranenge, no guhanga udushya. Twiyemeje kurema ahantu hateza imbere ubuzima n'imiryango mu bihe bizaza.", sw: "Kutoa suluhisho za kipekee za ujenzi na mali ambazo zinazidi matarajio ya wateja wetu huku tukijenga uhusiano wa kudumu kulingana na uaminifu, ubora, na uvumbuzi. Tumejitolea kuunda nafasi zinazoboresha maisha na jamii kwa vizazi vijavyo.", fr: "Fournir des solutions de construction et immobilières exceptionnelles qui dépassent les attentes de nos clients tout en établissant des relations durables basées sur la confiance, la qualité et l'innovation." },
  visionDesc: { en: "To be the most trusted and respected construction and property development company in the region, recognized for our commitment to quality, sustainability, and customer satisfaction. We envision a future where every project contributes to building stronger, more vibrant communities.", rw: "Kuba sosiyete y'ubwubatsi n'iterambere ry'imitungo yizewe kandi yubashywe cyane mu karere, izwiho kwiyemeza ubuziranenge, kuramba, no guha abakiriya ibyishimo. Dutekereza ejo hazaza aho buri mushingaugira uruhare mu kubaka imiryango ikomeye kandi ishyushye.", sw: "Kuwa kampuni inayoaminika na kuheshimiwa zaidi ya ujenzi na maendeleo ya mali katika mkoa, inayotambuliwa kwa kujitolea kwetu kwa ubora, uendelevu, na kuridhika kwa wateja.", fr: "Être l'entreprise de construction et de développement immobilier la plus fiable et respectée de la région, reconnue pour notre engagement envers la qualité, la durabilité et la satisfaction du client." },

  ourStoryP1: { en: "Founded in 2005, BSNG Ltd has grown from a small construction firm to become one of the region's most trusted names in construction and property development. Our name embodies our core mission: to Kubaka Bikomeye For The Next Generations.", rw: "Yashinzwe mu 2005, BSNG Ltd yavuye ku kigo gito cy'ubwubatsi iba rimwe mu mazina yizewe cyane mu karere mu bwubatsi bw'inzu n'iterambere ry'imitungo. Izina ryacu risobanura intego yacu y'ibanze: Kubaka Bikomeye ku bw'Ibyagaza.", sw: "Ilianzishwa mwaka 2005, BSNG Ltd imekua kutoka kampuni ndogo ya ujenzi na kuwa moja ya majina yanayoaminika zaidi katika mkoa katika ujenzi na maendeleo ya mali.", fr: "Fondée en 2005, BSNG Ltd est passée d'une petite entreprise de construction à l'un des noms les plus fiables de la région dans la construction et le développement immobilier." },
  ourStoryP2: { en: "With over 20 years of experience, we've completed more than 250 projects ranging from residential homes to large commercial complexes. Our success is built on a foundation of quality craftsmanship, innovative solutions, and unwavering commitment to our clients' vision.", rw: "Hamwe n'ubunararibonye bw'imyaka igera kuri 20, tumaze gukora imishinga isaga 250 kuva ku nzu zo guturamo kugeza ku nyubako nini z'ubucuruzi. Intsinzi yacu ishingiye ku buhanga bw'akazi, ibisubizo bishya, no kwiyemeza kudasubira inyuma ku cyerekezo cy'abakiriya bacu.", sw: "Kwa zaidi ya miaka 20 ya uzoefu, tumekamilisha zaidi ya miradi 250 kuanzia nyumba za makazi hadi majengo makubwa ya biashara.", fr: "Avec plus de 20 ans d'expérience, nous avons réalisé plus de 250 projets allant de maisons résidentielles à de grands complexes commerciaux." },
  ourStoryP3: { en: "Today, we employ over 150 skilled professionals and continue to expand our services while maintaining the personalized attention that has been our hallmark since day one.", rw: "Uyu munsi, dukoresha abakozi b'inzobere barenga 150 kandi dukomeje kwagura serivisi zacu mu gihe tugumana kwita ku muntu ku giti cye byabaye umwihariko wacu kuva ku munsi wa mbere.", sw: "Leo, tunaajiri wataalamu wenye ujuzi zaidi ya 150 na tunaendelea kupanua huduma zetu huku tukidumisha umakini wa kibinafsi.", fr: "Aujourd'hui, nous employons plus de 150 professionnels qualifiés et continuons d'étendre nos services tout en maintenant l'attention personnalisée qui est notre marque de fabrique depuis le premier jour." },

  // Updates Page Content
  allUpdates: { en: 'All Updates', rw: 'Amakuru Yose', sw: 'Taarifa Zote', fr: 'Toutes les Actualités' },
  updatesFound: { en: 'Updates Found', rw: 'Amakuru Abonetse', sw: 'Taarifa Zilizopatikana', fr: 'Actualités Trouvées' },
  updateFound: { en: 'Update Found', rw: 'Amakuru Abonetse', sw: 'Taarifa Iliyopatikana', fr: 'Actualité Trouvée' },

  tagProjects: { en: 'Projects', rw: 'Imishinga', sw: 'Miradi', fr: 'Projets' },
  tagAwards: { en: 'Awards', rw: 'Ibihembo', sw: 'Tuzo', fr: 'Récompenses' },
  tagEvents: { en: 'Events', rw: 'Ibirori', sw: 'Matukio', fr: 'Événements' },
  tagNews: { en: 'News', rw: 'Amakuru', sw: 'Habari', fr: 'Actualités' },
  tagCompany: { en: 'Company', rw: 'Ikigo', sw: 'Kampuni', fr: 'Entreprise' },

  // Property Schedule Viewing
  scheduleViewingTitle: { en: 'Schedule a Viewing', rw: 'Gusaba gusura inzu', sw: 'Panga kuona nyumba', fr: 'Planifier une visite' },
  requirementsPlaceholder: { en: 'Any specific requirements...', rw: 'Ibyo wifuza byihariye...', sw: 'Mahitaji yoyote maalum...', fr: 'Exigences spécifiques...' },
  // preferredDate, messageOptional, submitRequest removed as duplicates of lines 147-150




  // Why Choose Us
  competitivePricing: { en: 'Competitive Pricing', rw: 'Ibiciro Byiza', sw: 'Bei za Ushindani', fr: 'Prix Compétitifs' },
  expertTeamDesc: { en: 'Over 20 years of construction excellence with certified professionals', rw: 'Imyaka isaga 20 y\'indashyikirwa mu bwubatsi hamwe n\'inzobere zemewe', sw: 'Zaidi ya miaka 20 ya ubora wa ujenzi na wataalamu waliothibitishwa', fr: 'Plus de 20 ans d\'excellence en construction avec des professionnels certifiés' },
  qualityWorkDesc: { en: 'Rigorous quality control at every stage of the project', rw: 'Igenzura rikomeye ry\'ubuziranenge kuri buri cyiciro cy\'umushinga', sw: 'Udhibiti mkali wa ubora katika kila hatua ya mradi', fr: 'Contrôle qualité rigoureux à chaque étape du projet' },
  onTimeDeliveryDesc: { en: 'Proven track record of completing projects on schedule', rw: 'Amateka yagaragaye yo kurangiza imishinga ku gihe', sw: 'Rekodi iliyothibitishwa ya kukamilisha miradi kwa wakati', fr: 'Bilan éprouvé de l\'achèvement des projets dans les délais' },
  competitivePricingDesc: { en: 'Best value for your investment with transparent pricing', rw: 'Agaciro keza k\'ishoramari ryawe n\'ibiciro bisobanutse', sw: 'Thamani bora kwa uwekezaji wako na bei za uwazi', fr: 'Meilleur rapport qualité-prix pour votre investissement avec une tarification transparente' },
  whyChooseUsSubtitle: { en: "We're committed to delivering exceptional results that exceed expectations", rw: 'Twiyemeje gutanga ibisubizo byiza birenze ibyitezwe', sw: 'Tumejitolea kutoa matokeo ya kipekee yanayozidi matarajio', fr: 'Nous nous engageons à fournir des résultats exceptionnels qui dépassent les attentes' },

  // Our Process
  ourProcess: { en: "Our Process", rw: "Imikorere Yacu", sw: "Mchakato Wetu", fr: "Notre Processus" },
  processSubtitle: { en: "A streamlined approach to your project success", rw: "Uburyo bworoshye bwo kugera ku ntsinzi y'umushinga wawe", sw: "Njia iliyoroanishwa kwa mafanikio ya mradi wako", fr: "Une approche simplifiée pour le succès de votre projet" },
  consultation: { en: "Consultation", rw: "Ubujyanama", sw: "Ushauri", fr: "Consultation" },
  consultationDesc: { en: "Initial meeting to discuss your vision and requirements", rw: "Inama y'ibanze yo kuganira ku cyerekezo n'ibyo ukeneye", sw: "Mkutano wa awali kujadili maono na mahitaji yako", fr: "Réunion initiale pour discuter de votre vision et de vos besoins" },
  planning: { en: "Planning", rw: "Igenamigambi", sw: "Mipango", fr: "Planification" },
  planningDesc: { en: "Detailed planning, design, and cost estimation", rw: "Igenamigambi rirambuye, igishushanyo, n'igereranda ry'ibiciro", sw: "Mipango ya kina, muundo, na makadirio ya gharama", fr: "Planification détaillée, conception et estimation des coûts" },
  execution: { en: "Execution", rw: "Isyirwa mu Bikorwa", sw: "Utekelezaji", fr: "Exécution" },
  executionDesc: { en: "Professional construction with regular updates", rw: "Ubwubatsi bwa kinyamwuga hamwe n'amakuru ahoraho", sw: "Ujenzi wa kitaalamu na taarifa za mara kwa mara", fr: "Construction professionnelle avec des mises à jour régulières" },
  completion: { en: "Completion", rw: "isoza", sw: "Kukamilika", fr: "Achèvement" },
  completionDesc: { en: "Final inspection, handover, and ongoing support", rw: "Isuzu asoza, ihererekanya, n'ubufasha buhoraho", sw: "Ukaguzi wa mwisho, makabidhiano, na usaidizi unaoendelea", fr: "Inspection finale, remise et soutien continu" },

  // Chatbot
  chatbotHello: { en: "Hello! Welcome to BSNG Construction Company. How can I help you today?", rw: "Muraho! Murakaza neza muri BSNG Construction Company. Twabafasha iki uyu munsi?", sw: "Habari! Karibu BSNG Construction Company. Tunaweza kukusaidia nini leo?", fr: "Bonjour ! Bienvenue chez BSNG Construction Company. Comment puis-je vous aider aujourd'hui ?" },
  chatbotAssistant: { en: "BSNG Assistant", rw: "BSNG Assistant", sw: "BSNG Assistant", fr: "Assistant BSNG" },
  alwaysOnline: { en: "Always Online", rw: "Turi hano buri gihe", sw: "Tupo Mtandaoni Wakati Wote", fr: "Toujours en ligne" },
  typeYourMessage: { en: "Type your message...", rw: "Andika ubutumwa bwawe...", sw: "Andika ujumbe wako...", fr: "Tapez votre message..." },
  chatbotDefaultResponse: { en: "Thank you for your message. I'm BSNG's digital assistant. You can ask me about our construction services, properties for sale/rent, our location in Kibagabaga, or how to contact us!", rw: "Murakoze ku butumwa bwanyu. Ndi umufasha wa BSNG muri ubu buryo bwa digital. Mushobora kumbaza kuri serivisi zacu z'ubwubatsi, imitungo igurishwa cyangwa ikodeshwa, aho twereherereye i Kibagabaga, cyangwa uburyo mwatuvugisha!", sw: "Asante kwa ujumbe wako. Mimi ni msaidizi wa digitali wa BSNG. Unaweza kuniuliza kuhusu huduma zetu za ujenzi, mali zinazouzwa/kukodishwa, eneo letu huko Kibagabaga, au jinsi ya kuwasiliana nasi!", fr: "Merci pour votre message. Je suis l'assistant numérique de BSNG. Vous pouvez me poser des questions sur nos services de construction, nos propriétés à vendre/louer, notre emplacement à Kibagabaga ou comment nous contacter !" },
  ourLocationChat: { en: "Our Location", rw: "Aho Turi", sw: "Eneo Letu", fr: "Notre Emplacement" },
  chatbotLocResponse: { en: "We are located in Kibagabaga, Kigali, Rwanda (KG 15 Ave). You are welcome to visit our office anytime during business hours!", rw: "Turi i Kibagabaga, mu Mujyi wa Kigali, uRwanda (KG 15 Ave). Murahawe ikaze gusura ibiro byacu igihe cyose mu masaha y'akazi!", sw: "Tunapatikana Kibagabaga, Kigali, Rwanda (KG 15 Ave). Unakaribishwa kutembelea ofisi yetu wakati wowote saa za kazi!", fr: "Nous sommes situés à Kibagabaga, Kigali, Rwanda (KG 15 Ave). Vous êtes les bienvenus dans nos bureaux à tout moment pendant les heures d'ouverture !" },
  chatbotServiceResponse: { en: "BSNG Ltd offers a wide range of services including: Residential & Commercial Construction, Property Development, Real Estate Sales, Rentals, Renovation, and Project Management.", rw: "BSNG Ltd itanga serivisi nyinshi: Ubwubatsi, Iterambere ry'Imitungo, Kugurisha no Gukodesha Inzu n'Ibibanza, Ivugurura, n'Imiyoborere y'Imishinga.", sw: "BSNG Ltd inatoa huduma mbalimbali: Ujenzi, Maendeleo ya Mali, Mauzo ya Mali, Pangisha, Ukarabati, na Usimamizi wa Miradi.", fr: "BSNG Ltd propose une large gamme de services : Construction, Développement Immobilier, Vente et Location de Biens, Rénovation et Gestion de Projet." },
  chatbotConstResponse: { en: "We specialize in both Residential and Commercial construction. We handle everything from design to final completion with the highest quality standards.", rw: "Twibanda ku bwubatsi bw'inzu zo guturamo n'iz'ubucuruzi. Dukora byose kuva ku gishushanyo kugeza dusoje akazi ku rwego rwo hejuru.", sw: "Tunajishughulisha na ujenzi wa makazi na biashara. Tunashughulikia kila kitu kuanzia muundo hadi kukamilika kwa viwango vya juu zaidi.", fr: "Nous nous spécialisons dans la construction résidentielle et commerciale. Nous gérons tout, de la conception à la réalisation finale avec les normes de qualité les plus élevées." },
  chatbotRentResponse: { en: "We have several quality rental properties in prime locations around Kigali. You can check our 'Properties' page for current availability.", rw: "Dufite inzu nziza zo gukodesha ahantu hatandukanye muri Kigali. Mushobora kureba ku rupapuro rw'Imitungo (Properties) kugira ngo murebe izihari.", sw: "Tuna mali kadhaa za kupanga katika maeneo muhimu karibu na Kigali. Unaweza kuangalia ukurasa wetu wa 'Mali' (Properties) kwa upatikanaji wa sasa.", fr: "Nous avons plusieurs propriétés de location de qualité dans des emplacements privilégiés à Kigali. Vous pouvez consulter notre page 'Propriétés' (Properties) pour la disponibilité actuelle." },
  chatbotSellResponse: { en: "We deal in property sales including houses and plots in Kibagabaga and surrounding areas. Our plots come with all legal documents.", rw: "Dukora akazi ko kugurisha inzu n'ibibanza i Kibagabaga n'ahandi. Ibibanza byacu bifite ibyangombwa byose by'amategeko.", sw: "Tunajishughulisha na mauzo ya mali ikiwa ni pamoja na nyumba na viwanja huko Kibagabaga na maeneo ya karibu. Viwanja vyetu vina hati zote za kisheria.", fr: "Nous nous occupons de la vente de biens immobiliers, y compris des maisons et des terrains à Kibagabaga et dans les environs. Nos terrains sont fournis avec tous les documents légaux." },
  chatbotRenovResponse: { en: "Yes, we do professional renovations and remodeling. We can transform your existing space to look brand new.", rw: "Yego, dukora ivugurura ry'inzu ry'umwuga. Twahindura inzu yawe imaze igihe ikaba nshya.", sw: "Ndiyo, tunafanya ukarabati wa kitaalamu. Tunaweza kubadilisha nafasi yako iliyopo kuonekana mpya kabisa.", fr: "Oui, nous effectuons des rénovations professionnelles. Nous pouvons transformer votre espace existant pour qu'il ait l'air neuf." },
  chatbotContactResponse: { en: "You can reach us at +250 737 213 060 or email us at info@bsng.rw. We also have a contact form on our website!", rw: "Mwatuvugisha kuri +250 737 213 060 cyangwa mukatwandikira kuri info@bsng.rw. Dufite n'ifomu mwatuzuzira ku rubuga rwacu!", sw: "Unaweza kutupata kwa +250 737 213 060 au tutumie barua pepe kwa info@bsng.rw. Pia tuna fomu ya mawasiliano kwenye tovuti yetu!", fr: "Vous pouvez nous joindre au +250 737 213 060 ou nous envoyer un e-mail à info@bsng.rw. Nous avons également un formulaire de contact sur notre site !" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dt: (val: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('bsng_language') as Language;
    if (savedLanguage && ['en', 'rw', 'sw', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bsng_language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const dt = (val: any): string => {
    if (!val) return "";
    if (typeof val === 'object') {
      return val[language] || val['en'] || Object.values(val)[0] as string || "";
    }
    if (typeof val === 'string') {
      if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
        try {
          const obj = JSON.parse(val);
          return obj[language] || obj['en'] || Object.values(obj)[0] as string || "";
        } catch (e) {
          return val;
        }
      }
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dt }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
