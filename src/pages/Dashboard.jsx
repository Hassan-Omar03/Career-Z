import '../styles/dashboard-messages.css';
import '../styles/institution-hiring.css';
import '../styles/institution-ai.css';
import '../styles/teacher-ai.css';
import '../styles/teacher-support.css';
import '../styles/job-workspace-nav.css';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { HiringStatusControl, CvDownload, ApplicantContact, MEETING_PROVIDERS } from '../components/dashboard/ApplicantTools';
import AlertSettings from '../components/dashboard/AlertSettings';
import AdminJobReviewPanel from '../components/admin/AdminJobReviewPanel';
import GuestApplicants from '../components/dashboard/GuestApplicants';
import CvFileUpload from '../components/dashboard/CvFileUpload';
import InterviewJoin from '../components/dashboard/InterviewJoin';
import CoverLettersPanelV2 from '../components/dashboard/CoverLetters';
import PortfolioEditor from '../components/dashboard/PortfolioEditor';
import { ApplicationThread, ViewOfferLetterButton } from '../components/dashboard/OfferTools';
import AiCvDraftButton, { mergeDraft } from '../components/dashboard/AiCvDraft';
import InstitutionAgentsPanel from '../components/recruitment/InstitutionAgentsPanel';
import AgentRecruitmentPanel from '../components/recruitment/AgentRecruitmentPanel';
import AdminRecruitmentPanel from '../components/admin/AdminRecruitmentPanel';
import AdminScholarshipReviewPanel from '../components/admin/AdminScholarshipReviewPanel';
import AgentScholarshipsPanel, { DonorListingRequests } from '../components/scholarship/AgentScholarships';
import InstitutionProfileExtras from '../components/institution/InstitutionProfileExtras';
import AutoTimetable from '../components/institution/AutoTimetable';
import CampusReports from '../components/institution/CampusReports';
import InstitutionAssistantActions from '../components/institution/InstitutionAssistantActions';
import SmartApply from '../components/dashboard/SmartApply';
import TeacherSchedulePtm from '../components/dashboard/TeacherSchedulePtm';
import PtmHistory from '../components/dashboard/PtmHistory';
import SavedStatus from '../components/shared/SavedStatus';
import SavedForm from '../components/shared/SavedForm';
import ParentUpdates from '../components/dashboard/ParentUpdates';
import StudentGuardians from '../components/dashboard/StudentGuardians';
import GuardianProof from '../components/dashboard/GuardianProof';
import FamilyChatPolicy from '../components/dashboard/FamilyChatPolicy';
import {FamilyPolicy,StudentFamilyMeeting} from '../components/dashboard/FamilyPolicy';
import FamilyCafeteria from '../components/dashboard/FamilyCafeteria';
import {FamilyPrivate,FamilyAdminSummary} from '../components/dashboard/FamilyPrivate';
import {FamilyConnections, FamilyAcademic, FamilyPayments, InstitutionFamilyActions, FamilyTeacherNotes} from '../components/dashboard/FamilyCenter';
import FamilyClassrooms from '../components/dashboard/FamilyClassrooms';
﻿import {
  FaArrowUpRightFromSquare, FaBookmark, FaRegBookmark, FaCircle, FaXmark, FaShieldHalved, FaUsers, FaBuildingColumns, FaClipboardCheck, FaUser, FaUserShield,
  FaGauge, FaBuilding, FaChalkboardUser, FaBookOpen, FaClipboardList, FaAward, FaFileLines,
  FaGraduationCap, FaBriefcase, FaStore, FaWallet, FaSackDollar, FaSchool, FaChartLine,
  FaCalendarCheck, FaMoneyBillWave, FaHandshake, FaHourglassHalf, FaGear, FaBell, FaCommentDots, FaCircleQuestion, FaChevronDown,
  FaCartShopping, FaBoxOpen, FaBoxesStacked, FaTruck, FaStar, FaRegStar, FaTriangleExclamation, FaQrcode, FaLock,
  FaEarthAmericas, FaBullhorn, FaPuzzlePiece, FaAddressBook, FaEnvelope, FaDatabase, FaUserGear, FaNewspaper, FaWandMagicSparkles,
  FaUserGraduate, FaBed, FaKitMedical, FaCalendarDays, FaHeadset, FaRobot,
  FaCheck, FaLocationDot, FaExpand, FaMobileScreen, FaFaceSmile, FaCircleCheck,
  FaArrowLeft, FaArrowRight, FaArrowRotateLeft, FaCopy, FaEye, FaPaperPlane,
  FaMicrophone, FaHand, FaVideo, FaPowerOff, FaCrosshairs,
  FaIdCard,
} from 'react-icons/fa6';
import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useUrlTab from '../hooks/useUrlTab';
import { notificationLink, TAB_ALIASES } from '../utils/notificationLink';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { apiRequest, session } from '../api/client';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { verifyEmail, resendVerification } from '../api/auth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import InstitutionInventory from '../components/dashboard/InstitutionInventory';
import MedicalHealth from '../components/dashboard/MedicalHealth';
import InstitutionCommunity from '../components/dashboard/InstitutionCommunity';
import PlacementOffice from '../components/dashboard/PlacementOffice';
import LearningCenter from '../components/dashboard/LearningCenter';
import OfflineStudy from '../components/dashboard/OfflineStudy';
import CampusTourViewer from '../components/CampusTourViewer';
import QrScanner from '../components/QrScanner';
import AdminOperationsCenter from '../components/admin/AdminOperationsCenter';
import AdminVerificationPanel from '../components/admin/AdminVerificationPanel';
import VerifiedProfileSection from '../components/verification/VerifiedProfileSection';
import { PushNotificationToggle, StaffPermissionsEditor } from '../components/dashboard/NotificationSettings';
import GradingPolicyEditor from '../components/dashboard/GradingPolicyEditor';
import { QuestionBankPanel, QuestionBankPicker, ExamSecurityOptions, ExamIntegrityMonitor, IntegrityBadge } from '../components/dashboard/QuestionBank';
import CourseForum from '../components/dashboard/CourseForum';
import LessonMetadata from '../components/dashboard/LessonMetadata';
import InstitutionSettingsPanel from '../components/dashboard/InstitutionSettingsPanel';
import ResourceLibrary from '../components/dashboard/ResourceLibrary';
import SubtitleManager from '../components/dashboard/SubtitleManager';
import { startJazzCashCheckout, getJazzCashConfig, jazzCashResultMessage, startSafepayCheckout, getSafepayConfig, startPreferredCheckout, safepayResultMessage } from '../utils/jazzcashCheckout';
import { ManualPayButton, AdminManualPayments, PlatformAccountForm, ReceivingAccount, PayoutAccountReminder, IncomingManualPayments } from '../components/payments/ManualPay';
import { MyFundingRequests, AdminFundingReview, FundingDocumentLinks } from '../components/donors/FundingRequests';
import { ScholarshipDocumentsPicker, ScholarshipApplyButton, ApplicationDetails } from '../components/donors/ScholarshipApply';
import { DonorForecastCard, DonorImpactCard, RankScholarshipApplicants, AdminDonorsPanel as DonorManagementPanel } from '../components/donors/DonorMaster';
import { askMouSignature, MouButton, PartnerStats } from '../components/recruitment/PartnershipMou';
import BlogAdmin from '../components/admin/BlogAdmin';
import { VisaCases, StartVisaCase, AdminVisaPanel } from '../components/visa/Visa';
import { AdSlot, AdminAdsPanel, AdFreeCard } from '../components/ads/Ads';
import { AdminCommentsRatingsPanel } from '../components/admin/CommentsRatings';
import { MockInterviewCard } from '../components/jobs/MockInterview';
import JobDescriptionEditor from '../components/jobs/JobDescriptionEditor';
import JobImageField from '../components/jobs/JobImageField';
import CommissionRules from '../components/finance/CommissionRules';
import { MyReceipts, AdminReceipts } from '../components/finance/Receipts';
import FreelanceHub from '../components/freelance/FreelanceHub';
import FreelanceAdmin from '../components/freelance/FreelanceAdmin';
import JobDescription from '../components/discover/JobDescription';
import { AdminPluginsPanel, useModules, NAV_MODULE } from '../components/admin/Plugins';
import { AdminModerationPanel, AdminUsersPanel, AdminRemovedNote } from '../components/admin/Moderation';
import { AdminSitePagesPanel } from '../components/admin/SitePages';
import InvitePeople from '../components/institution/InvitePeople';
import { AcademyBatchesPanel, StudentAcademies, ConnectLearningCard, TeacherBatches, ParentAcademies } from '../components/academy/Academy';
import { BuyerEscrowActions, SellerEscrowActions, EscrowChip, DigitalListingFields, AdminEscrowPanel, AdminListingReview, BuyerOrdersList, SellerOrdersBoard, SellerReportPanel } from '../components/marketplace/Escrow';
import { EmployerDashboardFull, EmployerAnalyticsPanel, EmployerReviewsPanel, EmployerPromotionsPanel, EmployerPayrollPanel, EmployeeCompanyPanel, AdminEmployersPanel, downloadApplicantsCsv, useCompanyReviewLookup, ReviewCompanyButton } from '../components/employer/EmployerMaster';
import { EmployerEmailField, EmployerAgentRequests, EmployerConsentBadge, ImproveDescriptionButton, RankApplicantsButton, AdminAgentsPanel, MarketTrendsCard } from '../components/agents/AgentMaster';
import { usePaymentRecovery } from '../hooks/usePaymentRecovery';
import { isPlatformUploadAvailable, uploadToPlatformStorage } from '../utils/platformUpload';
import AppDialogHost from '../components/AppDialogHost';
import { passwordError } from '../utils/passwordPolicy';
import { CvVersions, CvAutofillButton, CareerRoadmapPanel, MyInternshipCertificates, IssueInternshipCertificate, InstitutionInternshipCertificate } from '../components/dashboard/CareerTools';
import { showConfirm, showPrompt } from '../utils/appDialog';
import { openPrivateFile } from '../components/recruitment/files';
import CareerZLiveClassroom from '../components/CareerZLiveClassroom';
import CvDesigner from '../components/dashboard/CvDesigner';
import GuidedResumeBuilder from '../components/dashboard/GuidedResumeBuilder';
import SiteAssistantSettings from '../components/admin/SiteAssistantSettings';
import DonorPublicProfilePanel from '../components/dashboard/DonorPublicProfilePanel';
import TeacherStandingCard from '../components/teacher/TeacherStandingCard';
import { ClassPromotionPanel, TeacherReviewsPanel, MyTeacherReviews } from '../components/institution/PeoplePanels';
import { TEACHER_CATEGORIES, MODE_LABEL } from '../utils/teacherProfile';
import { AiReport, OpsRecordTables } from '../components/dashboard/OpsInsightsReport';
import AcademicStructure from '../components/institution/AcademicStructure';
import AuthenticatorApp from '../components/dashboard/AuthenticatorApp';
import TransportNavigationMap from '../components/TransportNavigationMap';
import { createBrandedPdf, addPdfFooter, drawPdfTable, drawPdfSummary, PDF_COLORS } from '../utils/brandedPdf';
import {
  OverviewStats, WalletCard, QuickActions,
  ProfileCompletion, MiniCalendar, RecommendedGrid, RecentActivity
} from '../components/dashboard/DashboardWidgets';
import { StudentWorkspace } from './dashboard/StudentWorkspace';
import { TeacherWorkspace } from './dashboard/TeacherWorkspace';
import { ParentWorkspace } from './dashboard/ParentWorkspace';
import { InstitutionWorkspace } from './dashboard/InstitutionWorkspace';
import { RepresentativeWorkspace } from './dashboard/RepresentativeWorkspace';
import { EmployerWorkspace } from './dashboard/EmployerWorkspace';
import { DonorWorkspace } from './dashboard/DonorWorkspace';
import { SellerWorkspace } from './dashboard/SellerWorkspace';
import { AgentWorkspace } from './dashboard/AgentWorkspace';
import { AdminWorkspace } from './dashboard/AdminWorkspace';

// Every workspace is a fully separate dashboard: its own sidebar menu, its
// own landing view, its own panels. Switching role switches all of it.
const STUDENT_PAGES = {
  summary: ['Dashboard', 'Your studies, progress and upcoming opportunities at a glance.', FaGauge],
  cafeteria: ['Cafeteria', 'Browse campus meals and keep track of your orders.', FaWallet],
  resourceLibrary: ['Resource Library & Playlists', 'Find lesson resources and organize your revision playlists.', FaBookOpen],
  offlineStudy: ['Offline Study', 'Save course materials and keep learning wherever you are.', FaFileLines],
  learningAnalytics: ['Learning Analytics', 'Understand your progress, attendance and areas to practise.', FaChartLine],
  aiAssistant: ['AI Student Assistant', 'Plan your studies, practise new skills and get learning support.', FaRobot],
  digitalLocker: ['Digital Locker', 'Keep your academic documents organized and easy to find.', FaLock],
  studentId: ['Digital Student ID', 'Access your student identity and verification details.', FaQrcode],
  parentConnections: ['Parent Connections', 'Manage family connections and the information you share.', FaUsers],
  receivedDonations: ['Received Donations', 'Track your funding requests and support received.', FaMoneyBillWave],
  goals: ['Goals & Achievements', 'Set your next milestone and celebrate your progress.', FaAward],
  community: ['Study Groups', 'Learn together, share ideas and support your classmates.', FaUsers],
  campusLife: ['Campus Life', 'Discover campus news, activities and student opportunities.', FaNewspaper],
  hostel: ['My Hostel', 'View your room details and manage visitor or leave requests.', FaBed],
  transport: ['My Transport', 'Find your campus route, journey updates and transport details.', FaTruck],
  inventory: ['My Inventory', 'Review the campus equipment and items issued to you.', FaBoxesStacked],
  library: ['Institution Library', 'Explore books, digital resources and your borrowing history.', FaBookOpen],
  events: ['Events & Activities', 'Discover campus activities and manage your attendance.', FaCalendarDays],
  helpdesk: ['Institution Help Desk', 'Raise a concern and follow updates from your institution.', FaHeadset],
  health: ['My Health Record', 'Review your health information, emergency contacts and incidents.', FaKitMedical],
  courses: ['My Courses', 'Explore courses, continue learning and access your resources.', FaBookOpen],
  institutions: ['My Institutions', 'Connect with institutions and manage your academic journey.', FaBuilding],
  classes: ['My Classes', 'Your timetable, upcoming sessions and live classes in one place.', FaChalkboardUser],
  assignments: ['Assignments & Tests', 'Keep track of submissions, exams and results.', FaClipboardList],
  attendance: ['Attendance', 'Mark your attendance and review your history.', FaCalendarCheck],
  certificates: ['Certificates', 'Your achievements and verified learning credentials.', FaAward],
  applications: ['Applications', 'Follow your job, scholarship and admission applications.', FaFileLines],
  scholarships: ['Scholarships', 'Discover funding opportunities and track your applications.', FaGraduationCap],
  jobs: ['Jobs', 'Explore opportunities and take the next step in your career.', FaBriefcase],
  marketplace: ['Marketplace', 'Browse learning resources and manage your purchases.', FaStore],
  wallet: ['Wallet & Fees', 'Review your balance, transactions and academic fees.', FaWallet],
  profile: ['My Profile', 'Keep your personal details, academic profile and roles up to date.', FaUser],
  messages: ['Messages', 'Stay connected with your learning community.', FaCommentDots],
  notifications: ['Notifications', 'Updates and reminders that matter to you.', FaBell],
  calendar: ['Calendar', 'Plan your schedule around classes, deadlines and upcoming events.', FaCalendarCheck],
  settings: ['Account Settings', 'Manage your account preferences and security.', FaGear],
  help: ['Help Center', 'Find answers or get support with your account.', FaShieldHalved]
};

function StudentPageHeading({ page }) {
  const [title, description, Icon] = STUDENT_PAGES[page] || ['Student workspace', 'Your learning, opportunities and campus life in one place.', FaGraduationCap];
  return <header className="student-page-heading"><span className="student-page-symbol"><Icon aria-hidden="true" /></span><div><span className="eyebrow">STUDENT WORKSPACE</span><h1>{title}</h1><p>{description}</p></div></header>;
}

const WORKSPACES = {
  student: {
    label: 'Student', roles: ['student'], color: 'var(--forest)',
    greeting: 'Ready to keep learning?',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      {key:'cafeteria',label:'Cafeteria',icon:FaWallet},
      { key: 'profile', label: 'My Profile', icon: FaUser },
      { key: 'institutions', label: 'My Institutions', icon: FaBuilding },
      { key: 'myAcademies', label: 'Academies & Batches', icon: FaChalkboardUser },
      { key: 'classes', label: 'My Classes', icon: FaChalkboardUser },
      { key: 'courses', label: 'My Courses', icon: FaBookOpen },
      { key: 'resourceLibrary', label: 'Resource Library & Playlists', icon: FaFileLines },
      { key: 'offlineStudy', label: 'Offline Study', icon: FaFileLines },
      { key: 'assignments', label: 'Assignments & Tests', icon: FaClipboardList },
      { key: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
      { key: 'learningAnalytics', label: 'Learning Analytics', icon: FaChartLine },
      { key: 'aiAssistant', label: 'AI Student Assistant', icon: FaRobot },
      { key: 'certificates', label: 'Certificates', icon: FaAward },
      { key: 'digitalLocker', label: 'Digital Locker', icon: FaLock },
      { key: 'studentId', label: 'Digital Student ID', icon: FaQrcode },
      { key: 'applications', label: 'Applications', icon: FaFileLines },
      { key: 'parentConnections', label: 'Parent Connections', icon: FaUsers },
      { key: 'scholarships', label: 'Scholarships', icon: FaGraduationCap },
      { key: 'receivedDonations', label: 'Received Donations', icon: FaMoneyBillWave },
      { key: 'jobs', label: 'Jobs', icon: FaBriefcase },
      { key: 'marketplace', label: 'Marketplace', icon: FaStore },
      { key: 'wallet', label: 'Wallet', icon: FaWallet },
      { key: 'goals', label: 'Goals & Achievements', icon: FaAward },
      { key: 'community', label: 'Study Groups', icon: FaUsers },
      { key: 'campusLife', label: 'Campus Life', icon: FaNewspaper },
      { key: 'hostel', label: 'My Hostel', icon: FaBed },
      { key: 'transport', label: 'My Transport', icon: FaTruck }
      ,{ key: 'inventory', label: 'My Inventory', icon: FaBoxesStacked }
      ,{ key: 'library', label: 'Institution Library', icon: FaBookOpen }
      ,{ key: 'events', label: 'Events & Activities', icon: FaCalendarDays }
      ,{ key: 'helpdesk', label: 'Institution Help Desk', icon: FaHeadset }
      ,{ key: 'health', label: 'My Health Record', icon: FaClipboardCheck }
    ]
  },
  teacher: {
    label: 'Teacher', roles: ['teacher'], color: 'var(--gold)',
    greeting: "Here's your teaching workspace.",
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'teacherProfile', label: 'Teacher Profile', icon: FaChalkboardUser },
      { key: 'academyBatches', label: 'Academy Batches', icon: FaChalkboardUser },
      { key: 'employmentOffers', label: 'Employment Offers', icon: FaBriefcase },
      { key: 'timetable', label: 'Timetable', icon: FaCalendarCheck },
      { key: 'courses', label: 'My Classes', icon: FaBookOpen },
      { key: 'students', label: 'Students List', icon: FaUsers },
      { key: 'attendance', label: 'Student Attendance', icon: FaClipboardList },
      { key: 'myAttendance', label: 'My Attendance', icon: FaClipboardCheck },
      { key: 'homework', label: 'Homework / Assignments', icon: FaFileLines },
      { key: 'examination', label: 'Examinations', icon: FaAward },
      { key: 'questionBank', label: 'Question Bank', icon: FaAward },
      { key: 'results', label: 'Results / Grades', icon: FaChartLine },
      { key: 'materialUpload', label: 'Learning Material Upload', icon: FaFileLines },
      { key: 'liveClasses', label: 'Live Classes', icon: FaChalkboardUser },
      { key: 'studentCommunication', label: 'Student Communication', icon: FaCommentDots },
      { key: 'ptm', label: 'Parent-Teacher Meeting', icon: FaHandshake },
      { key: 'engagement', label: 'Class Engagement', icon: FaCommentDots },
      { key: 'earnings', label: 'Salary & Finance', icon: FaSackDollar },
      { key: 'performance', label: 'Performance Overview', icon: FaChartLine },
      { key: 'resourceLibrary', label: 'Resource Library', icon: FaFileLines },
      { key: 'aiAssistant', label: 'AI Teacher', icon: FaWandMagicSparkles },
      { key: 'instEvents', label: 'Events & Activities', icon: FaCalendarDays },
      { key: 'inventory', label: 'My Inventory', icon: FaBoxesStacked },
      { key: 'health', label: 'Student Health Incidents', icon: FaKitMedical },
      { key: 'instHelpdesk', label: 'Institution Help Desk', icon: FaHeadset },
      { key: 'placement', label: 'Placement Office', icon: FaBriefcase },
      { key: 'jobs', label: 'Jobs & Applications', icon: FaBriefcase },
      { key: 'scholarships', label: 'Scholarships & Funding', icon: FaGraduationCap },
      { key: 'offlineStudy', label: 'Offline Study', icon: FaFileLines },
      { key: 'profile', label: 'My Profile', icon: FaUser }
    ]
  },
  parent: {
    label: 'Parent', roles: ['parent'], color: 'var(--emerald)',
    greeting: "Here's what's happening with your children.",
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      {key:'cafeteria',label:'Cafeteria',icon:FaWallet},
      { key: 'children', label: 'My Children', icon: FaUsers },
      { key: 'childAcademies', label: 'Academies & Tuition', icon: FaChalkboardUser },
      { key: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
      { key: 'transport', label: 'Live Transport', icon: FaTruck },
      { key: 'progress', label: 'Results / Grades', icon: FaChartLine },
      { key: 'homework', label: 'Homework / Assignments', icon: FaFileLines },
      { key: 'examSchedule', label: 'Exam Schedule', icon: FaAward },
      { key: 'fees', label: 'Fee Management', icon: FaMoneyBillWave },
      { key: 'teacherMessages', label: 'Teacher Communication', icon: FaChalkboardUser },
      { key: 'ptm', label: 'Parent-Teacher Meeting', icon: FaHandshake },
      { key: 'aiAssistant', label: 'AI Parent Assistant', icon: FaRobot },
      { key: 'timetable', label: "Child's Timetable", icon: FaClipboardList },
      { key: 'performance', label: 'Performance Overview', icon: FaChartLine },
      { key: 'institutionInfo', label: 'School/Institution Info', icon: FaBuilding },
      { key: 'portfolio', label: 'Digital Portfolio', icon: FaFileLines },
      { key: 'health', label: 'Health Record', icon: FaClipboardCheck },
      { key: 'permissions', label: 'Permissions & Consent', icon: FaShieldHalved },
      { key: 'classroomObservation', label: 'Classroom Observation', icon: FaChalkboardUser },
      { key: 'wallet', label: 'Wallet / Payment Records', icon: FaWallet },
      { key: 'instEvents', label: 'Events & Activities', icon: FaCalendarDays },
      { key: 'instHelpdesk', label: 'Institution Help Desk', icon: FaHeadset },
      { key: 'profile', label: 'My Profile', icon: FaUser }
    ]
  },
  institution: {
    label: 'Institution', roles: ['institution_owner', 'academy_owner', 'institution_staff'], color: 'var(--forest-deep)',
    greeting: 'Manage your institution here.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      {key:'cafeteria',label:'Cafeteria',icon:FaWallet},
      { key: 'institution', label: 'My Institution', icon: FaSchool },
      { key: 'instSettings', label: 'Institute Settings', icon: FaSchool },
      { key: 'admissions', label: 'Admission Management', icon: FaUserGraduate },
      { key: 'invites', label: 'Invite People', icon: FaEnvelope },
      { key: 'staff', label: 'Staff Management', icon: FaUsers },
      { key: 'teachers', label: 'Teacher Management', icon: FaChalkboardUser },
      { key: 'students', label: 'Student Management', icon: FaUsers },
      { key: 'parents', label: 'Parent Management', icon: FaUsers },
      { key: 'classes', label: 'Classes & Timetable', icon: FaClipboardList },
      { key: 'batches', label: 'Courses & Batches', icon: FaChalkboardUser },
      { key: 'attendance', label: 'Attendance Management', icon: FaCalendarCheck },
      { key: 'fees', label: 'Fee Management', icon: FaSackDollar },
      { key: 'receivedDonations', label: 'Received Donations', icon: FaMoneyBillWave },
      { key: 'payroll', label: 'Payroll', icon: FaMoneyBillWave },
      { key: 'examination', label: 'Examination Management', icon: FaAward },
      { key: 'certificates', label: 'Certificates & Degrees', icon: FaGraduationCap },
      { key: 'library', label: 'Library Management', icon: FaBookOpen },
      { key: 'hostel', label: 'Hostel Management', icon: FaBed },
      { key: 'wardenDashboard', label: 'Warden Dashboard', icon: FaBed },
      { key: 'transport', label: 'Transport Management', icon: FaTruck },
      { key: 'inventory', label: 'Inventory Management', icon: FaBoxesStacked },
      { key: 'health', label: 'Medical & Health', icon: FaKitMedical },
      { key: 'events', label: 'Events & Activities', icon: FaCalendarDays },
      { key: 'helpdesk', label: 'Complaint & Help Desk', icon: FaHeadset },
      { key: 'aiAssistant', label: 'AI Operations Assistant', icon: FaRobot },
      { key: 'jobsHiring', label: 'Jobs & Hiring', icon: FaBriefcase },
      { key: 'placement', label: 'Placement Office', icon: FaBriefcase },
      { key: 'offlineStudy', label: 'Offline Study', icon: FaFileLines },
      { key: 'subscription', label: 'Subscription Plan', icon: FaStar },
      { key: 'reports', label: 'Reports', icon: FaChartLine },
      { key: 'communication', label: 'Communication Center', icon: FaBell },
      { key: 'campusLife', label: 'Newsletter & Magazine', icon: FaNewspaper },
      { key: 'campusTour', label: 'Virtual Campus Tour', icon: FaSchool },
      { key: 'profile', label: 'My Profile', icon: FaUser }
    ]
  },
  employer: {
    label: 'Employer', roles: ['employer'], color: 'var(--gold)',
    greeting: 'Manage your job postings and applicants.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'post', label: 'Post a Job', icon: FaFileLines },
      { key: 'jobs', label: 'My Jobs', icon: FaBriefcase },
      { key: 'employees', label: 'Employees', icon: FaUsers },
      { key: 'analytics', label: 'Analytics', icon: FaChartLine },
      { key: 'reviews', label: 'Reviews & Trust', icon: FaStar },
      { key: 'promotions', label: 'Promotions & Packages', icon: FaSackDollar },
      { key: 'payroll', label: 'Salary Management', icon: FaSackDollar },
      { key: 'partnerships', label: 'Institution Partnerships', icon: FaHandshake },
      { key: 'staff', label: 'Company Staff', icon: FaUserGear },
      { key: 'visaCases', label: 'Visa Cases', icon: FaEarthAmericas },
      { key: 'aiSettings', label: 'AI Settings', icon: FaRobot },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  },
  // Opens for anyone an employer added as company staff (master 12.10), whatever their account type.
  company_staff: {
    label: 'Company Staff', roles: [], color: 'var(--gold)',
    greeting: 'Work for the companies that added you as staff.',
    nav: [{ key: 'companyWork', label: 'Company Work', icon: FaBriefcase }, { key: 'aiSettings', label: 'AI Settings', icon: FaRobot }]
  },
  admin: {
    label: 'Admin', roles: ['admin', 'super_admin', 'platform_staff'], color: 'var(--rose)',
    greeting: 'Platform overview and moderation.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'verifications', label: 'User Verification & Approval', icon: FaIdCard },
      { key: 'jobReview', label: 'Held Jobs (auto-check)', icon: FaBriefcase },
      { key: 'scholarshipReview', label: 'Held Scholarships (auto-check)', icon: FaGraduationCap },
      { key: 'recruitmentPayments', label: 'Recruitment Payments', icon: FaSackDollar },
      { key: 'worldmap', label: 'World Map', icon: FaEarthAmericas },
      { key: 'institutions_mgmt', label: 'Institution Management', icon: FaBuildingColumns },
      { key: 'agents', label: 'Agent Management', icon: FaUsers },
      { key: 'donors', label: 'Donor Management', icon: FaHandshake },
      { key: 'employers', label: 'Employer Management', icon: FaBriefcase },
      { key: 'staff', label: 'Staff Management', icon: FaUserGear },
      { key: 'finance', label: 'Financial Management', icon: FaSackDollar },
      { key: 'commissionRules', label: 'Commission Rules', icon: FaSackDollar },
      { key: 'allReceipts', label: 'Receipts', icon: FaClipboardList },
      { key: 'marketplaceReview', label: 'Held Listings (auto-check)', icon: FaStore },
      { key: 'visa', label: 'Visa Center', icon: FaEarthAmericas },
      { key: 'moderation', label: 'Remove Fake Posts', icon: FaUserShield },
      { key: 'allUsers', label: 'All Users', icon: FaAddressBook },
      { key: 'ads', label: 'Ads Management', icon: FaBullhorn },
      { key: 'commentsRatings', label: 'Comments & Ratings', icon: FaCommentDots },
      { key: 'plugins', label: 'Plugins & Modules', icon: FaPuzzlePiece },
      { key: 'marketplaceEscrow', label: 'Marketplace Escrow & Disputes', icon: FaShieldHalved },
      { key: 'freelanceAdmin', label: 'Freelancer Hub', icon: FaHandshake },
      { key: 'complaints', label: 'Complaint Management', icon: FaClipboardList },
      { key: 'security', label: 'Security & Monitoring', icon: FaShieldHalved },
      { key: 'cms', label: 'Content (Pages & Blog)', icon: FaNewspaper },
      { key: 'backups', label: 'Backups & Maintenance', icon: FaDatabase },
      { key: 'aiInsights', label: 'AI Insights', icon: FaWandMagicSparkles },
      { key: 'aiSettings', label: 'My AI Key', icon: FaRobot },
      { key: 'operationsCenter', label: 'Operations Center', icon: FaGauge },
      { key: 'settings', label: 'Global Settings', icon: FaGear },
      { key: 'analytics', label: 'Reports', icon: FaChartLine },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  },
  donor: {
    label: 'Donor', roles: ['donor'], color: 'var(--emerald)',
    greeting: 'Manage the scholarships you fund.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'My Profile', icon: FaUser },
      { key: 'donorVerification', label: 'Verification/Documents', icon: FaClipboardCheck },
      { key: 'post', label: 'Post a Scholarship', icon: FaFileLines },
      { key: 'scholarships', label: 'My Scholarships', icon: FaGraduationCap },
      { key: 'opportunities', label: 'Explore Opportunities', icon: FaHandshake },
      { key: 'recommendedFunding', label: 'Recommended Requests', icon: FaClipboardCheck },
      { key: 'fundingApplications', label: 'Funding Applications', icon: FaFileLines },
      { key: 'donationHistory', label: 'My Donations', icon: FaWallet },
      { key: 'activeSponsorships', label: 'Active Sponsorships', icon: FaMoneyBillWave },
      { key: 'sponsoredStudents', label: 'Sponsored Students', icon: FaGraduationCap },
      { key: 'savedOpportunities', label: 'Saved Opportunities', icon: FaHourglassHalf },
      { key: 'impactReports', label: 'Impact Reports', icon: FaClipboardList },
      { key: 'aiSettings', label: 'AI Settings', icon: FaRobot },
      { key: 'wallet', label: 'Wallet & Payments', icon: FaWallet },
      { key: 'receipts', label: 'Receipts', icon: FaSackDollar },
      { key: 'donorMessages', label: 'Messages', icon: FaCommentDots },
      { key: 'donorNotifications', label: 'Notifications', icon: FaBell },
      { key: 'donorRecentActivity', label: 'Recent Activity', icon: FaCalendarCheck }
    ]
  },
  marketplace_seller: {
    label: 'Seller', roles: ['marketplace_seller'], color: 'var(--gold)',
    greeting: 'Manage your marketplace listings and orders.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'My Profile', icon: FaUser },
      { key: 'sellerVerification', label: 'Verification/Documents', icon: FaClipboardCheck },
      { key: 'addListing', label: 'Add New Listing', icon: FaFileLines },
      { key: 'listings', label: 'Products/Listings', icon: FaStore },
      { key: 'services', label: 'Services', icon: FaBriefcase },
      { key: 'orders', label: 'Orders', icon: FaClipboardList },
      { key: 'inventory', label: 'Inventory', icon: FaSackDollar },
      { key: 'returnsRefunds', label: 'Returns & Refunds', icon: FaHourglassHalf },
      { key: 'salesAnalytics', label: 'Sales Analytics', icon: FaChartLine },
      { key: 'earningsCommission', label: 'Earnings & Commission', icon: FaMoneyBillWave },
      { key: 'sellerWallet', label: 'Wallet & Transactions', icon: FaWallet },
      { key: 'withdrawals', label: 'Withdrawals', icon: FaWallet },
      { key: 'sellerReviews', label: 'Reviews & Ratings', icon: FaAward },
      { key: 'sellerMessages', label: 'Messages', icon: FaCommentDots },
      { key: 'sellerNotifications', label: 'Notifications', icon: FaBell }
    ]
  },
  education_agent: {
    label: 'Agent', roles: ['education_agent'], color: 'var(--gold)',
    greeting: 'Manage the job placements you handle for your clients.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'My Profile', icon: FaUser },
      { key: 'post', label: 'Post a Job', icon: FaFileLines },
      { key: 'jobs', label: 'My Job Posts', icon: FaBriefcase },
      { key: 'instituteRequests', label: 'Institute Requests', icon: FaHandshake },
      { key: 'agentScholarships', label: 'Scholarship Listings', icon: FaGraduationCap },
      { key: 'candidates', label: 'Applications', icon: FaUsers },
      { key: 'recommended', label: 'Candidates', icon: FaClipboardCheck },
      { key: 'shortlisted', label: 'Shortlisted Candidates', icon: FaClipboardCheck },
      { key: 'interviews', label: 'Interviews', icon: FaCalendarCheck },
      { key: 'hires', label: 'Successful Hires', icon: FaHandshake },
      { key: 'commission', label: 'Commissions', icon: FaMoneyBillWave },
      { key: 'wallet', label: 'Wallet & Transactions', icon: FaMoneyBillWave },
      { key: 'agentMessages', label: 'Messages', icon: FaCommentDots },
      { key: 'agentNotifications', label: 'Notifications', icon: FaBell },
      { key: 'agentVerification', label: 'Verification/Documents', icon: FaClipboardCheck },
      { key: 'visaCases', label: 'Visa Cases', icon: FaEarthAmericas },
      { key: 'aiSettings', label: 'AI Settings', icon: FaRobot }
    ]
  }
};

const WORKSPACE_PRIORITY = ['admin', 'institution', 'employer', 'education_agent', 'donor', 'marketplace_seller', 'teacher', 'parent', 'student'];

// A limited view of the 'institution' workspace for staff whose Institution.staff.role is
// "representative" — no payroll/finance/full-staff-management, per the spec's explicit note
// that Representatives don't get Admin's full access.
const REPRESENTATIVE_WORKSPACE = {
  label: 'Representative', roles: ['institution_staff'], color: 'var(--forest-deep)',
  greeting: 'Guide prospective students through admissions.',
  nav: [
    { key: 'summary', label: 'Dashboard', icon: FaGauge },
    { key: 'profile', label: 'My Profile', icon: FaUser },
    { key: 'inquiries', label: 'Student Inquiries', icon: FaClipboardList },
    { key: 'applications', label: 'Applications', icon: FaFileLines },
    { key: 'assignedStudents', label: 'Assigned Students', icon: FaUsers },
    { key: 'meetings', label: 'Meetings / Consultations', icon: FaHandshake },
    { key: 'repMessages', label: 'Messages', icon: FaCommentDots },
    { key: 'followUps', label: 'Follow-ups', icon: FaClipboardCheck },
    { key: 'programs', label: 'Programs & Courses', icon: FaBookOpen },
    { key: 'admissionsInfo', label: 'Admissions Information', icon: FaGraduationCap },
    { key: 'repScholarships', label: 'Scholarships', icon: FaAward },
    { key: 'virtualFair', label: 'Virtual Fair', icon: FaChalkboardUser },
    { key: 'documents', label: 'Documents / Resources', icon: FaFileLines }
  ]
};

const WARDEN_WORKSPACE = {
  label: 'Warden', roles: ['institution_staff'], color: 'var(--forest-deep)',
  greeting: 'Manage your assigned hostel rooms and residents.',
  nav: [
    { key: 'wardenDashboard', label: 'Warden Dashboard', icon: FaBed },
    { key: 'wallet', label: 'Wallet & Transactions', icon: FaWallet },
    { key: 'profile', label: 'My Profile', icon: FaUser }
  ]
};

const DRIVER_WORKSPACE = {
  label: 'Driver', roles: ['institution_staff'], color: 'var(--forest-deep)',
  greeting: 'Manage your assigned vehicle, route and student journeys.',
  nav: [
    { key: 'driverDashboard', label: 'Driver Dashboard', icon: FaTruck },
    { key: 'wallet', label: 'Wallet & Transactions', icon: FaWallet },
    { key: 'profile', label: 'My Profile', icon: FaUser }
  ]
};

// Text saved through a wrong encoding (e.g. 'â€”' for '—') reads back correctly.
const MOJIBAKE = [['â€”', '—'], ['â€“', '–'], ['â€™', '’'], ['â€˜', '‘'], ['â€œ', '“'], ['â€', '”'], ['â€¦', '…'], ['Â·', '·']];
const fixText = (s) => MOJIBAKE.reduce((out, [bad, good]) => out.split(bad).join(good), String(s ?? ''));
const shortWhen = (d) => new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
function Tag({ status, label }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    under_review: 'bg-indigo-100 text-indigo-800'
  };
  return <span className={`cz-tag cz-tag-${styles[status] ? status : 'other'} px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{label ?? status}</span>;
}

// The single source of truth for job-application status coloring + human label —
// used everywhere a JobApplication.status value is rendered, so all 7 real statuses
// (Applied/Application Viewed/Shortlisted/Interview Scheduled/Selected/Rejected/Hired) show correctly.
// Applying always happens on the job's own page, where the description, salary and the CV choice
// (saved CV, CV Version, upload, or build one) are shown.
function openApplyPage(jobId) { window.location.assign(`/jobs/${jobId}?action=apply`); }

const JOB_APP_STATUS = {
  pending: { tag: 'pending', label: 'Applied' },
  viewed: { tag: 'pending', label: 'Screening' },
  shortlisted: { tag: 'pending', label: 'Shortlisted' },
  interview: { tag: 'pending', label: 'Interview' },
  final_interview: { tag: 'pending', label: 'Final interview' },
  selected: { tag: 'pending', label: 'Offer' },
  accepted: { tag: 'approved', label: 'Offer accepted' },
  hired: { tag: 'approved', label: 'Joined' },
  completed: { tag: 'approved', label: 'Completed' },
  rejected: { tag: 'rejected', label: 'Not selected' },
  withdrawn: { tag: 'rejected', label: 'Withdrawn' }
};

const INTERVIEW_STATUS = {
  scheduled: { tag: 'pending', label: 'Scheduled' },
  completed: { tag: 'approved', label: 'Completed' },
  cancelled: { tag: 'rejected', label: 'Cancelled' }
};


function ComingSoon({ label, note }) {
  return (
    <div className="admin-notice" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FaHourglassHalf aria-hidden="true" />
      <span><strong>{label}</strong> {note || "is on the roadmap for this workspace and isn't wired up to real data yet."}</span>
    </div>
  );
}

// Companies that added this user as staff (invited or active).
function useCompanyMemberships(userId) {
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(() => { if (userId) apiRequest('/employer-staff/mine/companies').then((d) => setList(d || [])).catch(() => setList([])).finally(() => setLoaded(true)); }, [userId]);
  useEffect(load, [load]);
  return [list, load, loaded];
}

const STAFF_PERMISSION_LABEL = { post_jobs: 'Post jobs', manage_applicants: 'Applicants & interviews', make_offers: 'Offers', view_reports: 'Reports', manage_payments: 'Payments', manage_employees: 'Employees' };
// Institute staff (not the owner) see only the institute screens their permissions open (master 5.6,
// 15D.18; client audit point 25). Some roles do their work by role name rather than a permission.
const PERMISSION_TABS = {
  'application:approve': ['admissions'], 'fee:manage': ['fees', 'receivedDonations'], 'students:manage': ['students', 'attendance'],
  'staff:review': ['teachers', 'staff'], 'grading:manage': ['examination', 'certificates'], 'questionbank:manage': ['examination'],
  'content:review:department': ['batches'], 'content:review:principal': ['batches'], 'communication:send': ['communication', 'campusLife', 'helpdesk'],
  'parents:manage': ['parents'], 'ops:manage': ['reports', 'aiAssistant'], 'settings:manage': ['institution', 'instSettings'],
  'timetable:manage': ['classes'], 'placement:manage': ['placement'], 'recruitment:manage': ['jobsHiring'],
  'institution:health:manage': ['health'], 'transport:manage': ['transport'], 'ai:use': ['aiAssistant']
};
const ROLE_TABS = { librarian: ['library'], lab_assistant: ['inventory'], warden: ['hostel'], principal: ['events'], vice_principal: ['events'], coordinator: ['events'] };
function staffInstitutionTabs(staffRoles) {
  const tabs = new Set(['summary', 'profile']);
  for (const r of staffRoles || []) { for (const p of r.permissions || []) for (const k of PERMISSION_TABS[p] || []) tabs.add(k); for (const k of ROLE_TABS[r.role] || []) tabs.add(k); }
  return tabs;
}
// Platform staff see only the admin screens of the departments the Super Admin gave them (client scope 6.1).
const DEPARTMENT_TABS = { verification: ['verifications', 'jobReview', 'scholarshipReview'], finance: ['finance', 'allReceipts', 'recruitmentPayments'], support: ['complaints'], security: ['security'], content: ['cms'], moderation: ['moderation'] };
const STAFF_ROLE_LABEL = { hr: 'HR', finance: 'Finance', manager: 'Manager', recruiter: 'Recruiter', supervisor: 'Supervisor' };

function CompanyInviteBanner({ invites, onFlash, onDone }) {
  const [busy, setBusy] = useState(null);
  if (!invites.length) return null;
  async function respond(id, decision) {
    setBusy(id);
    try { await apiRequest(`/employer-staff/mine/${id}/respond`, { method: 'PATCH', body: { decision } }); onFlash(decision === 'accepted' ? 'You joined the company staff. Open the Company Staff workspace.' : 'Invitation declined.', 'success'); onDone(); }
    catch (err) { onFlash(err.message); } finally { setBusy(null); }
  }
  return (
    <div className="company-invites">
      {invites.map((c) => (
        <div key={c._id} className="card company-invite">
          <div>
            <strong>{c.employer?.fullName || 'A company'} added you as {STAFF_ROLE_LABEL[c.role] || c.role}</strong>
            <div className="company-perm-chips">{(c.permissions || []).map((x) => <span key={x} className="company-perm-chip">{STAFF_PERMISSION_LABEL[x] || x}</span>)}</div>
          </div>
          <div className="company-invite-actions">
            <button type="button" className="btn btn-primary" disabled={busy === c._id} onClick={() => respond(c._id, 'accepted')}>Accept</button>
            <button type="button" className="btn staff-remove" disabled={busy === c._id} onClick={() => respond(c._id, 'declined')}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// The member's workspace: pick a company, then use only the screens their permissions allow.
function CompanyWorkPanel({ companies, onFlash, onChanged }) {
  const [companyId, setCompanyId] = useState(companies[0]?.employer?._id || '');
  const company = companies.find((c) => c.employer?._id === companyId) || companies[0];
  const has = (x) => (company?.permissions || []).includes(x);
  const sections = [
    has('view_reports') && ['reports', 'Dashboard'],
    has('post_jobs') && ['post', 'Post a Job'],
    (has('post_jobs') || has('manage_applicants')) && ['jobs', 'Jobs & Applicants'],
    has('manage_employees') && ['employees', 'Employees'],
    has('manage_payments') && ['payments', 'Payments & Salary']
  ].filter(Boolean);
  const [section, setSection] = useUrlTab('companyWork', sections[0]?.[0] || '');
  const active = sections.some(([k]) => k === section) ? section : sections[0]?.[0];
  const [reloadKey, setReloadKey] = useState(0);
  if (!company) return <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>When an employer adds you as staff and you accept, their company appears here.</p>;
  const employer = company.employer._id;
  async function leave() {
    if (!(await showConfirm(`Leave the staff of ${company.employer.fullName}? You lose access to its hiring screens.`, { title: 'Leave company', confirmLabel: 'Leave', danger: true }))) return;
    try { await apiRequest(`/employer-staff/mine/${company._id}/leave`, { method: 'POST' }); onFlash('You left this company.', 'success'); onChanged(); } catch (err) { onFlash(err.message); }
  }
  return (
    <div className="company-work">
      <div className="card company-work-head">
        <div>
          {companies.length > 1
            ? <label className="hiring-field"><span>Company</span><select className="form-select" value={employer} onChange={(e) => setCompanyId(e.target.value)}>{companies.map((c) => <option key={c._id} value={c.employer._id}>{c.employer.fullName}</option>)}</select></label>
            : <h3>{company.employer.fullName}</h3>}
          <p>You work here as <strong>{STAFF_ROLE_LABEL[company.role] || company.role}</strong>. Everything you post or send is in the company's name.</p>
          <div className="company-perm-chips">{company.permissions.map((x) => <span key={x} className="company-perm-chip">{STAFF_PERMISSION_LABEL[x] || x}</span>)}</div>
        </div>
        <button type="button" className="btn staff-remove" onClick={leave}>Leave company</button>
      </div>
      <nav className="cz-tabbar" aria-label="Company sections">
        {sections.map(([k, label]) => <button key={k} type="button" className={`cz-tab${active === k ? ' active' : ''}`} aria-pressed={active === k} onClick={() => setSection(k)}>{label}</button>)}
      </nav>
      <div key={employer}>
        {/* "Company overview" already shows active jobs, applicants, shortlisted, interviews and hires, so the
            separate CompanyReports row repeated them (audit N-22). */}
        {active === 'reports' && <><EmployerDashboardFull employer={employer} /><EmployerAnalyticsPanel employer={employer} /></>}
        {active === 'post' && <EmployerPostJobPanel onFlash={onFlash} employer={employer} onPosted={() => { setReloadKey((n) => n + 1); if (has('manage_applicants') || has('post_jobs')) setSection('jobs'); }} />}
        {active === 'jobs' && <EmployerJobsPanel onFlash={onFlash} employer={employer} reloadKey={reloadKey} />}
        {active === 'employees' && <EmployerEmploymentsPanel onFlash={onFlash} employer={employer} />}
        {active === 'payments' && <><EmployerPromotionsPanel onFlash={onFlash} employer={employer} /><EmployerPayrollPanel onFlash={onFlash} employer={employer} /></>}
      </div>
    </div>
  );
}

function PendingRoleBanner() {
  const [pending, setPending] = useState([]);
  useEffect(() => {
    apiRequest('/roles/my-requests').then((list) => {
      setPending(list.filter((r) => r.status === 'pending' || r.status === 'under_review'));
    }).catch(() => setPending([]));
  }, []);

  if (pending.length === 0) return null;

  return (
    <div className="admin-notice" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <FaHourglassHalf aria-hidden="true" />
      <span>
        Your <strong>{pending.map((r) => r.requestedRole.replace(/_/g, ' ')).join(', ')}</strong> dashboard is unlocked, but posting (jobs, scholarships,
        listings, courses) is locked until Super Admin verifies your account — check the Profile tab for status.
      </span>
    </div>
  );
}

function SummaryRow({ items }) {
  return (
    <div className="admin-stats">
      {items.map((item) => (
        <div className="admin-stat" key={item.label}>
          <div className="admin-stat-top"><span>{item.label}</span><span className="admin-stat-icon"><item.icon aria-hidden="true" /></span></div>
          <strong>{item.value ?? '—'}</strong>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

// An Institute Representative is institution staff with a deliberately limited dashboard —
// no payroll/finance/full-staff-management access. `undefined` = not checked yet, `null` =
// not a representative anywhere, object = the institution + role they represent.
function useInstitutionStaffInfo(roles, signal = 0) {
  const [staffRoles, setStaffRoles] = useState(undefined);
  useEffect(() => {
    if (!roles.includes('institution_staff')) { setStaffRoles([]); return; }
    apiRequest('/institutions/mine/staff-roles').then((list) => {
      setStaffRoles(list);
    }).catch(() => setStaffRoles([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.join(','), signal]);
  return staffRoles;
}

const ADMIN_NAV_GROUPS = [
  { title: 'Overview', keys: ['summary', 'analytics', 'worldmap', 'aiInsights'] },
  { title: 'Verification & Moderation', keys: ['verifications', 'jobReview', 'scholarshipReview', 'marketplaceReview', 'moderation', 'commentsRatings', 'complaints'] },
  { title: 'Academic Operations', keys: ['institutions_mgmt', 'allUsers', 'staff', 'agents', 'donors', 'employers', 'visa'] },
  { title: 'Finance & Commercial', keys: ['finance', 'commissionRules', 'allReceipts', 'recruitmentPayments', 'marketplaceEscrow', 'freelanceAdmin'] },
  { title: 'System Administration', keys: ['settings', 'operationsCenter', 'plugins', 'ads', 'cms', 'security', 'backups', 'aiSettings', 'profile'] }
];

const EXTRA_TABS = ['messages', 'notifications', 'calendar', 'settings', 'help', 'aiSettings', 'receipts', 'freelance', 'impactOverview', 'learningCenter', 'aiCreative', 'advancedControl'];

export default function Dashboard() {
  const { user, refreshProfile, accountStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Only account types that are admin-approved with a complete profile open a workspace (the API
  // enforces the same rule); exempt staff accounts keep all their roles.
  const roles = (accountStatus && !accountStatus.exempt ? accountStatus.accessibleRoles : user?.roles) || [];
  const [msg, setMsg] = useState(null);
  // staffSignal: the owner changed this person's institute access; the menu reloads without a refresh.
  const { staffSignal } = useRealtime();
  const staffRoles = useInstitutionStaffInfo(roles, staffSignal);
  const repInfo = staffRoles?.find((r) => r.role === 'representative') || null;
  const wardenInfo = staffRoles?.find((r) => r.role === 'warden') || null;
  const driverInfo = staffRoles?.find((r) => r.role === 'driver') || null;
  const isRepOnly = !!repInfo && !roles.includes('institution_owner') && !roles.includes('academy_owner');
  const isWardenOnly = !!wardenInfo && !roles.includes('institution_owner') && !roles.includes('academy_owner');
  const isDriverOnly = !!driverInfo && !roles.includes('institution_owner') && !roles.includes('academy_owner');
  const isPlatformStaffOnly = roles.includes('platform_staff') && !roles.some((role) => ['admin', 'super_admin'].includes(role));
  const [staffAccess, setStaffAccess] = useState(null);
  useEffect(() => { if (!isPlatformStaffOnly) return undefined; let alive = true; void staffSignal; apiRequest('/admin/staff/me').then((a) => { if (alive) setStaffAccess(a); }).catch(() => {}); return () => { alive = false; }; }, [isPlatformStaffOnly, staffSignal]);

  const [companies, reloadCompanies, companiesLoaded] = useCompanyMemberships(user?._id);
  const available = [...WORKSPACE_PRIORITY.filter((key) => WORKSPACES[key].roles.some((r) => roles.includes(r))), ...(companies.some((c) => c.status === 'active') ? ['company_staff'] : [])];
  // Login's "Log in as" picker can request a specific workspace to open on directly,
  // overriding the usual priority order (admin > institution > ... > student).
  // A deep link (?ws=&tab=, e.g. from a notification) or the login picker can choose where to open.
  const deepLink = new URLSearchParams(location.search);
  const resolveTarget = (ws, tab) => {
    const tabs = tab ? (TAB_ALIASES[tab] || [tab]) : [];
    const order = [ws, ...available].filter((k, i, a) => k && available.includes(k) && a.indexOf(k) === i);
    for (const k of order) { const hit = tabs.find((x) => WORKSPACES[k].nav.some((n) => n.key === x)); if (hit) return { ws: k, tab: hit }; }
    // A shared page reached by a link with no workspace named: it opens in the first workspace.
    if (!ws && tabs.some((x) => EXTRA_TABS.includes(x)) && available[0]) return { ws: available[0], tab: tabs.find((x) => EXTRA_TABS.includes(x)) };
    if (!ws || !available.includes(ws)) return null;
    // Tabs outside the main menu: shared pages, and the institute staff's own menus.
    const extra = tabs.find((x) => EXTRA_TABS.includes(x) || (ws === 'institution' && [REPRESENTATIVE_WORKSPACE, WARDEN_WORKSPACE, DRIVER_WORKSPACE].some((w) => w.nav.some((n) => n.key === x))));
    return { ws, tab: extra || null };
  };
  const linkTarget = resolveTarget(deepLink.get('ws') || location.state?.workspace, deepLink.get('tab') || location.state?.tab);
  const requestedWorkspace = linkTarget?.ws || location.state?.workspace;
  const defaultWorkspace = (requestedWorkspace && available.includes(requestedWorkspace)) ? requestedWorkspace : (available[0] || 'student');

  const [activeWorkspace, setWorkspaceState] = useState(defaultWorkspace);
  const [activeTab, setTabState] = useState(new URLSearchParams(location.search).has('ptm') && ['teacher','parent'].includes(defaultWorkspace) ? 'ptm' : location.search.includes('courseCheckout=success') && defaultWorkspace === 'student'
    ? 'courses' : linkTarget?.tab && linkTarget.ws === defaultWorkspace ? linkTarget.tab : WORKSPACES[defaultWorkspace].nav.some((n) => n.key === location.state?.tab) ? location.state.tab : WORKSPACES[defaultWorkspace].nav[0].key);
  // The open workspace and tab live in the address, so refresh keeps them and the browser's back
  // and forward buttons move one tab at a time. Opening a tab adds a step and starts it clean;
  // a correction the page makes by itself replaces the step, so back never gets stuck on it.
  const openTab = (ws, tab, replace = false) => {
    setWorkspaceState(ws);
    setTabState(tab);
    const q = replace ? new URLSearchParams(window.location.search) : new URLSearchParams();
    if (q.get('ws') === ws && q.get('tab') === tab) return;
    const current = new URLSearchParams(window.location.search);
    if (!replace && current.get('ws') === ws && current.get('tab') === tab) return;
    q.set('ws', ws);
    q.set('tab', tab);
    navigate(`/dashboard?${q}`, { replace, state: replace ? location.state : undefined });
  };
  const setActiveTab = (tab) => openTab(activeWorkspace, tab);
  // Follows the address: back, forward, refresh, or a link such as a notification.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('ws') === 'company_staff' && !companiesLoaded) return;
    const asked = q.get('tab') || q.get('ws');
    const target = asked ? resolveTarget(q.get('ws'), q.get('tab')) : null;
    if (target) openTab(target.ws, target.tab || WORKSPACES[target.ws].nav[0].key, true);
    else openTab(activeWorkspace, activeTab, true);
  }, [location.search, companiesLoaded, available.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  // A newly opened tab starts at its top, not at the previous tab's scroll position.
  useEffect(() => { window.scrollTo(0, 0); }, [activeTab, activeWorkspace]);
  // Lets any panel (e.g. Teacher -> Student Communication) jump straight into a conversation with
  // a specific, already-identified person instead of landing on Messages' generic "paste a User
  // ID" box — the actual gap being fixed here.
  const [pendingMessageUser, setPendingMessageUser] = useState(null);
  function openMessageWith(u) { setPendingMessageUser(u); setActiveTab('messages'); }

  useEffect(() => {
    if (!available.includes(activeWorkspace)) {
      openTab(defaultWorkspace, WORKSPACES[defaultWorkspace].nav[0].key, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, roles.join(',')]);

  useEffect(() => {
    const shared = ['messages', 'notifications', 'calendar', 'settings', 'help'];
    if (activeWorkspace === 'institution' && isWardenOnly && !shared.includes(activeTab) && !WARDEN_WORKSPACE.nav.some((item) => item.key === activeTab)) {
      openTab(activeWorkspace, 'wardenDashboard', true);
    }
  }, [activeWorkspace, activeTab, isWardenOnly]);

  useEffect(() => {
    const shared = ['messages', 'notifications', 'calendar', 'settings', 'help'];
    if (activeWorkspace === 'institution' && isDriverOnly && !shared.includes(activeTab) && !DRIVER_WORKSPACE.nav.some((item) => item.key === activeTab)) {
      openTab(activeWorkspace, 'driverDashboard', true);
    }
  }, [activeWorkspace, activeTab, isDriverOnly]);

  function switchWorkspace(key) {
    openTab(key, WORKSPACES[key].nav[0].key);
  }

  function flash(text, type = 'error') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  }

  usePaymentRecovery(user?._id, flash);

  // Back from JazzCash's hosted page: the backend has already verified and applied the result.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get('jazzcash') || params.get('safepay');
    if (!result) return;
    const [text, type] = params.get('safepay') ? safepayResultMessage(result) : jazzCashResultMessage(result, params.get('code'));
    flash(params.get('ref') ? `${text} (Ref ${params.get('ref')})` : text, type);
    const clean = new URLSearchParams(window.location.search);
    ['jazzcash', 'safepay', 'ref', 'code'].forEach((k) => clean.delete(k));
    navigate(`/dashboard?${clean}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modulesOn = useModules();
  const wsBase = (isRepOnly && activeWorkspace === 'institution') ? REPRESENTATIVE_WORKSPACE
    : (isWardenOnly && activeWorkspace === 'institution') ? WARDEN_WORKSPACE
    : (isDriverOnly && activeWorkspace === 'institution') ? DRIVER_WORKSPACE
    : (isPlatformStaffOnly && activeWorkspace === 'admin')
      ? { ...WORKSPACES.admin, label: staffAccess?.title || 'Platform Staff', nav: WORKSPACES.admin.nav.filter((item) => ['summary', 'profile', 'settings'].includes(item.key) || (staffAccess?.departments || []).some((d) => (DEPARTMENT_TABS[d] || []).includes(item.key))) }
      : (() => {
          const workspace = WORKSPACES[activeWorkspace] || WORKSPACES.student;
          if (activeWorkspace !== 'institution') return workspace;
          const staffOnly = !roles.includes('institution_owner') && !roles.includes('academy_owner') && Array.isArray(staffRoles);
          const allowed = staffOnly ? staffInstitutionTabs(staffRoles) : null;
          return { ...workspace, nav: workspace.nav.filter((item) => item.key !== 'wardenDashboard' && (!allowed || allowed.has(item.key))) };
        })();
  // Optional modules the Super Admin turned off leave the menus (admins keep everything).
  const ws = activeWorkspace === 'admin' ? wsBase : { ...wsBase, nav: wsBase.nav.filter((item) => modulesOn[NAV_MODULE[item.key]] !== false) };
  useEffect(() => { document.title = `${ws.nav.find(item => item.key === activeTab)?.label || SHARED_TAB_LABELS[activeTab] || 'Dashboard'} | CareerZ.pk`; }, [activeTab, ws.label]);
  // A staff member whose access just shrank leaves a tab they may no longer open.
  const navKeys = ws.nav.map((n) => n.key).join(',');
  useEffect(() => {
    const limited = (activeWorkspace === 'institution' && Array.isArray(staffRoles) && !roles.includes('institution_owner') && !roles.includes('academy_owner') && !isRepOnly && !isWardenOnly && !isDriverOnly) || (activeWorkspace === 'admin' && isPlatformStaffOnly && staffAccess);
    if (limited && !['messages', 'notifications', 'calendar', 'settings', 'help', 'freelance', 'receipts'].includes(activeTab) && !ws.nav.some((n) => n.key === activeTab)) openTab(activeWorkspace, 'summary', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navKeys, activeTab, activeWorkspace]);
  // The verified account type behind this workspace, whose mandatory profile lives under My Profile.
  const verifiedRole = { student: 'student', teacher: 'teacher', parent: 'parent', donor: 'donor', marketplace_seller: 'marketplace_seller', education_agent: 'education_agent',
    institution: (isRepOnly || isWardenOnly || isDriverOnly) ? null : roles.includes('institution_owner') ? 'institution_owner' : roles.includes('academy_owner') ? 'academy_owner' : null }[activeWorkspace] || null;
  const NAME_TITLES = new Set(['mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'miss', 'dr', 'dr.', 'prof', 'prof.', 'sir', 'madam']);
  const nameWords = (user?.fullName || '').split(' ').filter(Boolean);
  const firstName = nameWords.find((w) => !NAME_TITLES.has(w.toLowerCase())) || nameWords[0] || 'there';
  const SHARED_TAB_LABELS = { freelance: 'Freelancer Hub', receipts: 'My Receipts', messages: 'Messages', notifications: 'Notifications', calendar: 'Calendar', settings: 'Settings', help: 'Help Center', aiSettings: 'AI Settings' };
  const SHARED_TABS = Object.keys(SHARED_TAB_LABELS);
  const activeTabLabel = SHARED_TAB_LABELS[activeTab] || ws.nav.find((t) => t.key === activeTab)?.label || ws.label;

  return (
    <DashboardLayout
      trail={[ws.label, activeTabLabel]}
      activeRole={activeWorkspace}
      navItems={ws.nav}
      navGroups={ADMIN_NAV_GROUPS}
      showFreelance={modulesOn.freelance !== false}
      activeKey={activeTab}
      onSelect={setActiveTab}
    >
      {activeWorkspace === 'student' && activeTab !== 'summary' ? <StudentPageHeading page={activeTab} /> : <div className={`admin-intro${activeWorkspace === 'student' && activeTab === 'summary' ? ' student-intro' : ''}`} style={{ borderInlineStart: `6px solid ${ws.color}`, paddingInlineStart: 20 }}>
        <div>
          <div className="eyebrow">{ws.label.toUpperCase()} WORKSPACE</div>
          <h1>Welcome back, {firstName}.</h1>
          <p>{ws.greeting}</p>
        </div>
        <span className="admin-access"><FaUserShield aria-hidden="true" />{ws.label}</span>
      </div>}

      <PendingRoleBanner />
      <CompanyInviteBanner invites={companies.filter((c) => c.status === 'invited')} onFlash={flash} onDone={reloadCompanies} />
      <InstituteInviteBanner onFlash={flash} onJoined={refreshProfile} />

      {available.length > 1 && (
        <nav className="cz-tabbar" aria-label="Switch workspace" style={{ marginBottom: 20 }}>
          {available.map((key) => (
            <button key={key} type="button" aria-pressed={activeWorkspace === key} className={`cz-tab${activeWorkspace === key ? ' active' : ''}`} onClick={() => switchWorkspace(key)}>
              {WORKSPACES[key].label}
            </button>
          ))}
        </nav>
      )}

      {msg && <div role="status" className={`dash-toast ${msg.type}`}>{msg.text}</div>}

      {/* Paid people (institute, teacher, seller, agent) are warned until they add the account buyers pay into. */}
      {activeWorkspace !== 'admin' && (() => {
        const walletTab = ws.nav.some((n) => n.key === 'sellerWallet') ? 'sellerWallet' : ws.nav.some((n) => n.key === 'wallet') ? 'wallet' : null;
        return walletTab && <PayoutAccountReminder onAdd={() => { setActiveTab(walletTab); setTimeout(() => { const el = document.getElementById('receiving-account'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); el?.querySelector('button')?.click(); }, 500); }} />;
      })()}

      <div className={`workspace-content${activeWorkspace === 'student' ? ' student-page-content institution-ui student-redesign' : ''}`} data-page={activeTab} key={`${activeWorkspace}-${activeTab}`}>
        {['summary', 'overview'].includes(activeTab) && activeWorkspace !== 'admin' && <AdSlot placement="dashboard" />}
        {activeTab === 'messages' && <MessagesPanel onFlash={flash} user={user} restrictedStaffMessaging={isWardenOnly || isDriverOnly} initialUser={pendingMessageUser} onConsumedInitialUser={() => setPendingMessageUser(null)} />}
        {activeTab === 'notifications' && <NotificationsPanel onFlash={flash} />}
        {activeTab === 'receipts' && <MyReceipts onFlash={flash} />}
        {activeTab === 'freelance' && <div className="institution-ui institution-remaining-ui fl-ui"><FreelanceHub onFlash={flash} /></div>}
        {activeTab === 'calendar' && <CalendarPanel onFlash={flash} />}
        {activeTab === 'settings' && (activeWorkspace !== 'admin' || isPlatformStaffOnly) && <><SettingsPanel user={user} onFlash={flash} onChanged={refreshProfile} />{activeWorkspace==='student'&&<><ProfilePanel user={user} onFlash={flash} onChanged={refreshProfile}/><RolesPanel onFlash={flash} onChanged={refreshProfile}/><SupportComplaintPanel onFlash={flash}/></>}</>}
        {activeTab === 'help' && <HelpCenterPanel onFlash={flash} />}
        {activeTab === 'aiSettings' && <div className="institution-ui employer-ui"><p className="text-sm" style={{ color: 'var(--ink-soft)', margin: '0 0 12px' }}>Connect your own AI provider key. Every AI button in your dashboard (job builder, improve, rank, forecasts, reports, review checks) uses this key. CareerZ does not pay for it.</p><AiSettingsPanel onFlash={flash} purposes={[AI_PURPOSES[0]]} /></div>}
        {(!SHARED_TABS.includes(activeTab) || (activeWorkspace === 'admin' && activeTab === 'settings' && !isPlatformStaffOnly)) && (
          <>
            {activeTab === 'profile' && verifiedRole && <VerifiedProfileSection role={verifiedRole} onFlash={flash} />}
            {activeWorkspace === 'student' && <StudentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
            {activeWorkspace === 'teacher' && <div className="institution-ui teacher-ui"><TeacherWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} onMessageUser={openMessageWith} /></div>}
            {activeWorkspace === 'parent' && <div className="institution-ui teacher-ui parent-ui"><ParentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} onMessageUser={u=>{setPendingMessageUser(u);setActiveTab('messages');}} /></div>}
            {activeWorkspace === 'institution' && (isRepOnly
              ? <RepresentativeWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} repInfo={repInfo} />
              : <InstitutionWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} isWarden={isWardenOnly} />)}
            {activeWorkspace === 'employer' && <div className="institution-ui employer-ui"><EmployerWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} /></div>}
            {activeWorkspace === 'company_staff' && <div className="institution-ui employer-ui"><CompanyWorkPanel companies={companies.filter((c) => c.status === 'active')} onFlash={flash} onChanged={reloadCompanies} /></div>}
            {activeWorkspace === 'admin' && <div className="institution-ui institution-remaining-ui admin-ui"><AdminWorkspace tab={activeTab} user={user} roles={roles} onFlash={flash} onChanged={refreshProfile} /></div>}
            {activeWorkspace === 'donor' && <div className="institution-ui donor-ui"><DonorWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} /></div>}
            {activeWorkspace === 'marketplace_seller' && <div className="institution-ui seller-ui"><SellerWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} /></div>}
            {activeWorkspace === 'education_agent' && <div className="institution-ui agent-ui"><AgentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} /></div>}
          </>
        )}
      </div>
      <AppDialogHost />
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------- Student


// A student viewing their OWN health record (spec 15D.14) — before this, only the institution
// and a linked guardian could see it at all.
function StudentHealthPanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/students/me/health').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (!data) return <p role="status" className="admin-notice">Loading health record...</p>;
  return (
    <div>
      <h3 className="font-semibold mb-3">My Health Record</h3>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 8, maxWidth: 520 }}>
        <div><strong className="text-xs" style={{ color: 'var(--ink-soft)' }}>Blood Group</strong><p>{data.bloodGroup || 'Not on file'}</p></div>
        <div><strong className="text-xs" style={{ color: 'var(--ink-soft)' }}>Allergies</strong><p>{(data.allergies || []).length ? data.allergies.join(', ') : 'None on file'}</p></div>
        <div><strong className="text-xs" style={{ color: 'var(--ink-soft)' }}>Medical History</strong><p>{data.medicalNotes || 'None on file'}</p></div>
        <div><strong className="text-xs" style={{ color: 'var(--ink-soft)' }}>Emergency Contact</strong><p>{data.emergencyContact?.name ? `${data.emergencyContact.name} (${data.emergencyContact.relation}) — ${data.emergencyContact.phone}` : 'Not on file'}</p></div>
      </div>
      <h4 className="font-semibold mt-6 mb-2">Vaccination History</h4>
      <Table headers={['Vaccine', 'Date', 'Notes']} rows={(data.vaccinations || []).map((v) => [v.name, v.date ? new Date(v.date).toLocaleDateString() : '—', v.notes || '—'])} empty="No vaccination records on file." />
      <h4 className="font-semibold mt-6 mb-2">Incident History</h4>
      <Table headers={['Date', 'Severity', 'Description', 'Action Taken']} rows={(data.incidents || []).map((i) => [new Date(i.occurredAt).toLocaleDateString(), <Tag status={i.severity === 'severe' ? 'rejected' : i.severity === 'moderate' ? 'pending' : 'approved'} label={i.severity} />, i.description, i.actionTaken || '—'])} empty="No incidents on file." />
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>This record is maintained by your institution. To correct anything here, contact your institution's administration.</p>
    </div>
  );
}


function StudentInstitutionEventsPanel({ onFlash }) {
  const [data, setData] = useState(null);
  function load() { apiRequest('/institution-ops/mine/events').then(setData).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);
  async function rsvp(eventId) { try { await apiRequest(`/institution-ops/events/${eventId}/rsvp`, { method: 'POST' }); onFlash('RSVP recorded.', 'success'); load(); } catch (err) { onFlash(err.message); } }
  async function cancelRsvp(eventId) { try { await apiRequest(`/institution-ops/events/${eventId}/rsvp`, { method: 'DELETE' }); onFlash('RSVP withdrawn.', 'success'); load(); } catch (err) { onFlash(err.message); } }
  if (!data) return <p role="status" className="admin-notice">Loading events...</p>;
  return <div><h3 className="font-semibold mb-3">Events & Activities</h3><Table headers={['Event', 'Type', 'Date', 'Venue', 'Status', 'Action']} rows={data.events.map((event) => {
    const going = (event.rsvps || []).some((entry) => String(entry.user) === String(data.userId));
    return [event.title, event.type.replaceAll('_', ' '), new Date(event.startDate).toLocaleString(), event.venue || '—', <Tag status="approved" label={event.status} />,
      going ? <button className="btn" onClick={() => cancelRsvp(event._id)}>Cancel RSVP</button> : <button className="btn btn-primary" onClick={() => rsvp(event._id)}>RSVP</button>];
  })} empty="No upcoming events." /></div>;
}

function StudentInstitutionHelpDeskPanel({ onFlash }) {
  const [tickets, setTickets] = useState(null);
  const [institutionId, setInstitutionId] = useState('');
  const [form, setForm] = useState({ category: 'academic', subject: '', description: '', priority: 'medium' });
  function load() { apiRequest('/institution-ops/tickets/mine').then(setTickets).catch((err) => onFlash(err.message)); apiRequest('/students/me/institutions').then((list) => setInstitutionId(list.find((item) => item.status === 'active')?.institution?._id || list[0]?.institution?._id || '')).catch(() => {}); }
  useEffect(load, [onFlash]);
  async function submit(e) { e.preventDefault(); try { await apiRequest(`/institution-ops/${institutionId}/tickets`, { method: 'POST', body: form }); onFlash('Help-desk ticket created.', 'success'); setForm({ category: 'academic', subject: '', description: '', priority: 'medium' }); load(); } catch (err) { onFlash(err.message); } }
  return <div><h3 className="font-semibold mb-3">Institution Help Desk</h3><form onSubmit={submit} className="card space-y-3 mb-4" style={{ padding: 18, maxWidth: 620 }}><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{HELPDESK_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['low', 'medium', 'high', 'urgent'].map((item) => <option key={item}>{item}</option>)}</select><input className="form-input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /><textarea className="form-input" rows={4} placeholder="Describe the issue" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><button className="btn btn-primary" disabled={!institutionId}>Submit Ticket</button></form>{tickets === null ? <p role="status" className="admin-notice">Loading tickets...</p> : <Table headers={['Ticket', 'Institution', 'Subject', 'Priority', 'Status', 'Resolution']} rows={tickets.map((ticket) => [ticket.ticketNumber, ticket.institution?.name || '—', ticket.subject, ticket.priority, <Tag status={['resolved', 'closed'].includes(ticket.status) ? 'approved' : 'pending'} label={ticket.status.replace('_', ' ')} />, ticket.resolutionNotes || '—'])} empty="No help-desk tickets." />}</div>;
}


function StudentTutoringPanel({ onFlash }) {
  const [links, setLinks] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() { apiRequest('/teacher-students/as-student').then(setLinks).catch(() => setLinks([])); }
  useEffect(load, []);

  async function respond(id, decision) {
    setBusyId(id);
    try { await apiRequest(`/teacher-students/${id}/respond`, { method: 'PATCH', body: { decision } }); onFlash(`Invitation ${decision}.`, 'success'); load(); }
    catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }
  async function revokeLink(id) {
    setBusyId(id);
    try { await apiRequest(`/teacher-students/${id}/revoke`, { method: 'POST' }); onFlash('Relationship ended.', 'success'); load(); }
    catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  const pending = (links || []).filter((l) => l.status === 'invited');
  const others = (links || []).filter((l) => l.status !== 'invited');
  const STATUS_TAG = { consent_pending: 'pending', active: 'approved', paused: 'pending', completed: 'approved', removed: 'rejected' };

  return (
    <div className="admin-section" style={{ marginTop: 16 }}>
      <div className="admin-section-heading"><div><h2>Independent Tutoring Invitations</h2></div></div>
      {pending.map((l) => (
        <div key={l._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sand-line)' }}>
          <div>
            <strong className="text-sm">{l.teacher?.fullName}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{l.course?.title}{l.subject ? ` — ${l.subject}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === l._id} onClick={() => respond(l._id, 'accepted')}>Accept</button>
            <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === l._id} onClick={() => respond(l._id, 'declined')}>Decline</button>
          </div>
        </div>
      ))}
      {pending.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No pending invitations.</p>}
      <Table
        headers={['Teacher', 'Course', 'Status', 'Action']}
        rows={others.map((l) => [
          l.teacher?.fullName, l.course?.title, <Tag status={STATUS_TAG[l.status] || 'pending'} label={l.status} />,
          ['active', 'paused', 'consent_pending'].includes(l.status)
            ? <button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} disabled={busyId === l._id} onClick={() => revokeLink(l._id)}>End</button>
            : '—'
        ])}
        empty="No tutoring history yet."
      />
    </div>
  );
}





















function StudentJobsPanel({ onFlash, user }) {
  const routeLocation = useLocation();
  const routeState = routeLocation.state;
  const [sub, setSub] = useUrlTab('sub', routeState?.sub || 'dashboard');
  const groups = [
    { key: 'overview', label: 'Overview', icon: FaGauge, items: [['dashboard', 'Dashboard']] },
    { key: 'discover', label: 'Find work', icon: FaMagnifyingGlass, items: [['search', 'Search jobs'], ['internships', 'Internships'], ['recommended', 'Recommended'], ['smartApply', 'Smart Apply'], ['saved', 'Saved jobs']] },
    { key: 'applications', label: 'Applications', icon: FaClipboardList, items: [['applications', 'My applications'], ['interviews', 'Interviews'], ['offers', 'Job offers'], ['visa', 'Visa cases'], ['referrals', 'Institution referrals']] },
    { key: 'career', label: 'CV & Career', icon: FaUser, items: [['profile', 'My profile'], ['resume', 'CV builder'], ['cvVersions', 'CV versions'], ['cvDesign', 'Templates & download'], ['coverLetters', 'Cover letters'], ['portfolio', 'Portfolio'], ['roadmap', 'Career roadmap'], ['tools', 'Career tools']] },
    { key: 'updates', label: 'Updates', icon: FaBell, items: [['alerts', 'Job alerts'], ['messages', 'Messages'], ['notifications', 'Notifications']] }
  ];
  const activeGroup = groups.find(group => group.items.some(([key]) => key === sub)) || groups[0];
  // JobDashboardPanel's onNavigate resolves a sub-tab key locally (e.g. 'resume', 'search').
  function navigate(key) {
    setSub(key);
  }
  return (
    <div className="job-seeker-workspace">
      <div className="job-workspace-navigation">
        <nav className="job-primary-nav" aria-label="Job workspace sections">
          {groups.map(group => { const Icon = group.icon; return <button key={group.key} type="button" aria-pressed={activeGroup.key === group.key} className={activeGroup.key === group.key ? 'active' : ''} onClick={() => setSub(group.items[0][0])}><Icon aria-hidden="true" /><span>{group.label}</span></button>; })}
        </nav>
        {activeGroup.items.length > 1 && <nav className="job-secondary-nav" aria-label={activeGroup.label + ' options'}>
          {activeGroup.items.map(([key, label]) => <button key={key} type="button" aria-pressed={sub === key} className={sub === key ? 'active' : ''} onClick={() => setSub(key)}>{label}</button>)}
        </nav>}
      </div>
      {sub === 'dashboard' && <JobDashboardPanel onFlash={onFlash} onNavigate={navigate} user={user} />}
      {sub === 'profile' && <JobMyProfilePanel onFlash={onFlash} onNavigate={setSub} />}
      {sub === 'search' && <JobSearchPanel onFlash={onFlash} />}
      {sub === 'internships' && <InternshipsPanel onFlash={onFlash} />}
      {sub === 'recommended' && <RecommendedJobsPanel onFlash={onFlash} />}
      {sub === 'smartApply' && <SmartApply onFlash={onFlash} />}
      {sub === 'saved' && <SavedJobsPanel onFlash={onFlash} />}
      {sub === 'applications' && <MyApplicationsPanel onFlash={onFlash} />}
      {sub === 'interviews' && <InterviewsPanel onFlash={onFlash} />}
      {sub === 'offers' && <><JobOffersPanel onFlash={onFlash} /><EmployeeCompanyPanel onFlash={onFlash} /></>}
      {sub === 'referrals' && <StudentReferralsPanel onFlash={onFlash} />}
      {sub === 'visa' && <VisaCases onFlash={onFlash} />}
      {sub === 'resume' && <ResumeEditorPanel onFlash={onFlash} user={user} onTemplates={() => setSub('cvDesign')} />}
      {sub === 'cvVersions' && <CvVersions onFlash={onFlash} />}
      {sub === 'cvDesign' && <CvDesigner user={user} onFlash={onFlash} />}
      {sub === 'roadmap' && <CareerRoadmapPanel onFlash={onFlash} onConnectAi={() => setSub('tools')} />}
      {sub === 'coverLetters' && <CoverLettersPanelV2 onFlash={onFlash} user={user} />}
      {sub === 'portfolio' && <PortfolioPanel onFlash={onFlash} onNavigate={setSub} />}
      {sub === 'alerts' && <JobAlertsPanel onFlash={onFlash} />}
      {sub === 'tools' && <CareerToolsPanel onFlash={onFlash} onNavigate={setSub} />}
      {sub === 'messages' && <JobMessagesPanel onFlash={onFlash} />}
      {sub === 'notifications' && <NotificationsPanel onFlash={onFlash} />}
    </div>
  );
}

// Employee/Job-Seeker home — Welcome/Profile → 6 Summary Cards → Recommended Jobs →
// Application Status → Upcoming Interviews → CV/Profile → Job Alerts preview → Quick Actions.
// No separate "Employee" role exists in this system (job seeking is a Student-workspace
// capability, same as scholarships/marketplace), so this lives inside the Jobs tab.
const WORK_MODE_LABEL = { onsite: 'Onsite', remote: 'Remote', hybrid: 'Hybrid' };

function formatSalary(j) {
  if (!j.salaryMin && !j.salaryMax) return 'Salary: Not disclosed';
  return `Salary: ${j.currency} ${j.salaryMin ?? ''}${j.salaryMax ? `–${j.salaryMax}` : ''}`;
}

// "View Job" fetches the job fresh (instead of reusing local list data) so the click itself
// records a real "recently viewed" event server-side — falls back to whatever was already on hand.
async function recordJobView(jobRefOrId, setViewingJob) {
  const id = jobRefOrId?._id || jobRefOrId;
  if (!id) return;
  try {
    setViewingJob(await apiRequest(`/jobs/${id}`));
  } catch {
    setViewingJob(typeof jobRefOrId === 'object' ? jobRefOrId : null);
  }
}

function JobLogo({ job, size = 36 }) {
  return job.companyLogo
    ? <img src={job.companyLogo} alt="" style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{(job.company || '?')[0]}</div>;
}

function JobDetailModal({ job, onClose, isSaved, onToggleSave, onApply }) {
  if (!job) return null;
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <div className="flex items-center gap-3">
            <JobLogo job={job} size={44} />
            <div>
              <h3>{job.title}{job.featured && new Date(job.featuredUntil) > new Date() && <span style={{ marginLeft: 8 }}><Tag status="approved" label="Featured" /></span>}</h3>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{job.company}</p>
            </div>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}><FaXmark aria-hidden="true" /></button>
        </div>
        <div className="u-modal-body">
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>
            {job.city ? `${job.city}, ` : ''}{job.country} · {WORK_MODE_LABEL[job.workMode] || 'Onsite'} · {job.type?.replace('_', ' ')}
            {job.visaSponsorship ? ' · Visa sponsorship available' : ''}
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>
            {formatSalary(job)} · {job.experienceYears || 0}+ yrs experience · Posted {new Date(job.createdAt).toLocaleDateString()}
            {job.applicationDeadline ? ` · Apply by ${new Date(job.applicationDeadline).toLocaleDateString()}` : ''}
          </p>
          {job.education && <p className="text-xs" style={{ marginBottom: 8 }}><strong>Education:</strong> {job.education}</p>}
          {job.skills?.length > 0 && <p className="text-xs" style={{ marginBottom: 8 }}><strong>Skills:</strong> {job.skills.join(', ')}</p>}
          {job.image && <img className="jd-image" src={job.image} alt={`${job.title} job`} loading="lazy" />}
          {job.description && <div className="text-sm" style={{ marginBottom: 8 }}><JobDescription text={job.description} /></div>}
          {(job.contactEmail || job.contactPhone) && (
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
              {job.contactEmail ? `Contact: ${job.contactEmail}` : ''}{job.contactEmail && job.contactPhone ? ' · ' : ''}{job.contactPhone || ''}
            </p>
          )}
        </div>
        <div className="u-modal-foot">
          {onToggleSave && <button type="button" className="btn" onClick={() => onToggleSave(job._id, isSaved)}>{isSaved ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>}
          {onApply && <button type="button" className="btn btn-primary" onClick={() => onApply(job._id)}>Apply Now</button>}
        </div>
      </div>
    </div>
  );
}

function JobDashboardPanel({ onFlash, onNavigate, user }) {
  const [dash, setDash] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [conversations, setConversations] = useState(null);

  function load() {
    apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message));
    apiRequest('/job-alerts/mine').then(setAlerts).catch(() => setAlerts([]));
    apiRequest('/messages/conversations').then(setConversations).catch(() => setConversations([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function apply(jobId) {
    openApplyPage(jobId); // full job page: description, salary, choose / upload / build the CV
  }
  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  const jobLabelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <>
      {/* 1. Profile Completion */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(user?.fullName || '?')[0]}</div>}
            <div>
              <strong className="text-sm">{user?.fullName || 'Job Seeker'}</strong>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.profile.title || 'Add your professional title'}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{dash.profile.location || 'Location not set'} · {dash.profile.experienceLevel || 'Experience level not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Profile {dash.profile.completeness}% complete</span>
            <button type="button" className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>Complete Profile</button>
          </div>
        </div>
      </div>

      {/* 2. Job Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3" style={{ marginBottom: 20 }}>
        <SummaryCard title="Recommended Jobs" count={dash.counts.recommended} onClick={() => onNavigate?.('search')} />
        <SummaryCard title="Saved Jobs" count={dash.counts.saved} onClick={() => onNavigate?.('saved')} />
        <SummaryCard title="Applied Jobs" count={dash.counts.applied} onClick={() => onNavigate?.('applications')} />
        <SummaryCard title="Interviews" count={dash.counts.interviews} onClick={() => onNavigate?.('interviews')} />
        <SummaryCard title="Job Offers" count={dash.counts.offers} onClick={() => onNavigate?.('applications')} />
        <SummaryCard title="Profile Views" count={dash.profile.profileViews} onClick={() => onNavigate?.('resume')} />
      </div>

      {/* 3. Recommended Jobs */}
      <div className="dash-section-title"><h2>Recommended Jobs</h2></div>
      <div className="grid grid-cols-1" style={{ marginBottom: 20, gap: 14 }}>
        {dash.recommendedJobs.length === 0 && (
          <div className="border border-[var(--sand-line)] rounded-xl p-4">
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No recommendations yet — add skills to your CV to get matched jobs.</p>
          </div>
        )}
        {dash.recommendedJobs.slice(0, 4).map((j) => {
          const isSaved = savedIds.includes(j._id) || dash.savedJobs.some((s) => s._id === j._id);
          return (
            <div key={j._id} className="hover-card border border-[var(--sand-line)] rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
                <div className="flex items-start" style={{ gap: 14 }}>
                  <JobLogo job={j} size={44} />
                  <div>
                    <strong className="text-sm">{j.title}{j.featured && new Date(j.featuredUntil) > new Date() && <span style={{ marginLeft: 6 }}><Tag status="approved" label="Featured" /></span>}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'} · {j.type?.replace('_', ' ')}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{formatSalary(j)} · {j.experienceYears || 0}+ yrs exp · Posted {new Date(j.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex" style={{ gap: 8, flexShrink: 0 }}>
                  <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Job</button>
                  <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => apply(j._id)}>Apply Now</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        isSaved={viewingJob ? (savedIds.includes(viewingJob._id) || dash.savedJobs.some((s) => s._id === viewingJob._id)) : false}
        onToggleSave={toggleSave}
        onApply={(id) => { apply(id); setViewingJob(null); }}
      />

      {/* 4. Application Status */}
      <div className="dash-section-title"><h2>Application Status</h2></div>
      <div className="card" style={{ padding: 12, marginBottom: 20 }}>
        <Table
          headers={['Job', 'Company', 'Status', 'Applied']}
          rows={dash.applications.slice(0, 5).map((a) => [a.job?.title, a.job?.company, <Tag status={JOB_APP_STATUS[a.status]?.tag} label={JOB_APP_STATUS[a.status]?.label || a.status} />, new Date(a.createdAt).toLocaleDateString()])}
          empty="No applications yet."
        />
        <button type="button" className="btn mt-2" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('applications')}>View All Applications</button>
      </div>

      {/* 5. Upcoming Interviews */}
      <div className="dash-section-title"><h2>Upcoming Interviews</h2></div>
      <div className="card" style={{ padding: dash.upcomingInterviews.length === 0 ? 0 : 16, marginBottom: 20 }}>
        {dash.upcomingInterviews.length === 0 && (
          <div className="student-empty-state">
            <FaCalendarCheck aria-hidden="true" />
            <p>No interviews scheduled</p>
            <span>Applications that move forward will show their interview slot here.</span>
          </div>
        )}
        {dash.upcomingInterviews.map((i, idx) => {
          const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
          return (
            <div key={i._id} className="flex items-center justify-between flex-wrap" style={{ gap: 12, padding: '14px 4px', borderBottom: idx < dash.upcomingInterviews.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
              <div>
                <strong className="text-sm">{i.job?.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{i.job?.company}</p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                  {new Date(i.scheduledDate).toLocaleDateString()} · {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {i.mode === 'physical' ? 'Physical' : 'Online'}
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                  {i.mode === 'physical' ? (i.location || 'Location to be confirmed') : 'Online on CareerZ (video room opens 15 minutes before)'}
                </p>
                <span style={{ display: 'inline-block', marginTop: 8 }}><Tag status={st.tag} label={st.label} /></span>
              </div>
              {i.mode === 'online' && i.status === 'scheduled'
                ? <InterviewJoin interview={i} />
                : <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => recordJobView(i.job, setViewingJob)}>View Details</button>}
            </div>
          );
        })}
      </div>

      {/* 6. CV/Resume + Skills */}
      <div className="dash-section-title"><h2>CV / Resume</h2></div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="student-progress-row">
          <span>CV completeness</span>
          <strong>{dash.cvCompleteness}%</strong>
        </div>
        <progress className="student-progress-bar" max="100" value={dash.cvCompleteness} aria-label="CV completeness" />
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 14 }}>
          Uploaded CV: {dash.cvFileUrl ? <a href={dash.cvFileUrl} target="_blank" rel="noreferrer">View file</a> : 'Not uploaded'} · Last updated {dash.cvLastUpdated ? new Date(dash.cvLastUpdated).toLocaleDateString() : 'never'}
        </p>
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}>
          <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>Upload CV</button>
          <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>{dash.cvCompleteness > 0 ? 'Update CV' : 'Build CV'}</button>
          <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('tools')}>AI CV Builder</button>
        </div>
      </div>

      {/* 7. Skills & Profile */}
      <div className="dash-section-title"><h2>Skills & Profile</h2></div>
      <div className="card job-skills-card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={jobLabelStyle}>Current skills</p>
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
          {dash.profile.skills.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>No skills added yet.</span>}
          {dash.profile.skills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)' }}>{s}</span>)}
        </div>

        <div className="job-skills-group" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)' }}>
          <p style={jobLabelStyle}>Missing / recommended skills</p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Based on skills most requested in currently open job postings.</p>
          <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
            {dash.profile.missingSkills.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Nothing missing — your CV covers the market's top requested skills.</span>}
            {dash.profile.missingSkills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--institution-tint)', color: 'var(--forest)', border: '1px solid var(--sand-line)' }}>{s}</span>)}
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          <div>
            <p style={jobLabelStyle}>Education</p>
            {dash.profile.education.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.education.map((ed, i) => <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{ed.degree}{ed.degree && ed.institution ? ' — ' : ''}{ed.institution}{ed.year ? ` (${ed.year})` : ''}</p>)}
          </div>
          <div>
            <p style={jobLabelStyle}>Work experience</p>
            {dash.profile.experience.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.experience.map((ex, i) => <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{ex.title}{ex.title && ex.company ? ' at ' : ''}{ex.company}{ex.duration ? ` (${ex.duration})` : ''}</p>)}
          </div>
          <div>
            <p style={jobLabelStyle}>Certifications</p>
            {dash.profile.certifications.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.certifications.length > 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{dash.profile.certifications.join(', ')}</p>}
          </div>
          <div>
            <p style={jobLabelStyle}>Portfolio</p>
            {dash.profile.portfolio.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.portfolio.map((p, i) => <p key={i} className="text-xs" style={{ marginTop: 6 }}><a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a></p>)}
          </div>
          <div>
            <p style={jobLabelStyle}>LinkedIn profile</p>
            <p className="text-xs" style={{ marginTop: 6 }}>{dash.profile.linkedinUrl ? <a href={dash.profile.linkedinUrl} target="_blank" rel="noreferrer">{dash.profile.linkedinUrl}</a> : <span style={{ color: 'var(--ink-soft)' }}>Not added yet.</span>}</p>
          </div>
        </div>

        <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', marginTop: 20 }} onClick={() => onNavigate?.('resume')}>Update Skills / Profile</button>
      </div>

      {/* Job Alerts (preview) */}
      <div className="dash-section-title"><h2>Job Alerts</h2></div>
      <div className="card" style={{ padding: (alerts?.length ?? 1) === 0 ? 0 : 16, marginBottom: 20 }}>
        {alerts === null && <p className="text-xs" style={{ color: 'var(--ink-soft)', padding: 16 }}>Loading...</p>}
        {alerts?.length === 0 && (
          <div className="student-empty-state">
            <FaBell aria-hidden="true" />
            <p>No saved alerts yet</p>
            <span>Set an alert so new matching jobs reach you first.</span>
          </div>
        )}
        {alerts?.slice(0, 3).map((a, i) => (
          <p key={a._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: i === 0 ? 0 : 8 }}>
            {a.keywords || 'Any keyword'} · {[a.city, a.country].filter(Boolean).join(', ') || 'Any location'} — {a.matchCount} matching jobs now
          </p>
        ))}
        {(alerts === null || (alerts && alerts.length > 0)) && (
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 12 }} onClick={() => onNavigate?.('alerts')}>{alerts?.length > 0 ? 'Manage Alerts' : 'Set Job Alert'}</button>
        )}
        {alerts?.length === 0 && (
          <div style={{ padding: '0 16px 16px' }}>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', width: '100%' }} onClick={() => onNavigate?.('alerts')}>Set Job Alert</button>
          </div>
        )}
      </div>

      {/* Messages / Notifications */}
      <div className="dash-section-title"><h2>Messages / Notifications</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 job-updates-grid" style={{ marginBottom: 20, gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <p style={jobLabelStyle}>Messages</p>
        {conversations === null && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Loading...</p>}
        {conversations?.length === 0 && (
          <div className="student-empty-state" style={{ minHeight: 100, padding: '20px 0' }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
          </div>
        )}
        {conversations?.slice(0, 3).map((c, i) => (
          <p key={c.user._id} className="text-xs" style={{ color: c.unread > 0 ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: c.unread > 0 ? 600 : 400, marginTop: i === 0 ? 10 : 8 }}>{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''} — {c.lastMessage}</p>
        ))}
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('messages')}>View Messages</button>
      </div>
      <div className="card job-notifications-preview" style={{ padding: dash.notifications.length === 0 ? 0 : 16 }}><p style={jobLabelStyle}>Notifications</p>
        {dash.notifications.length === 0 && (
          <div className="student-empty-state">
            <FaBell aria-hidden="true" />
            <p>No notifications yet</p>
          </div>
        )}
        {dash.notifications.slice(0, 3).map((n, idx) => (
          <div key={n._id} style={{ padding: '10px 0', borderBottom: idx < dash.notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <p className="text-xs" style={{ color: n.read ? 'var(--ink-soft)' : 'var(--ink)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
              <span className="text-xs" style={{ color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
            {n.body && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{n.body}</p>}
          </div>
        ))}
        {dash.notifications.length > 0
          ? <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 12 }} onClick={() => onNavigate?.('notifications')}>View All</button>
          : <div style={{ padding: '0 16px 16px' }}><button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', width: '100%' }} onClick={() => onNavigate?.('notifications')}>View All</button></div>}
      </div>
      </div>

      {/* 12. Recent Activity */}
      <div className="dash-section-title"><h2>Recent Activity</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 job-recent-grid" style={{ marginBottom: 20, gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Recently viewed jobs</p>
          {dash.recentActivity.recentlyViewedJobs.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet — open a job's "View Job" to see it here.</p>}
          {dash.recentActivity.recentlyViewedJobs.map((v, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{v.job?.title} @ {v.job?.company} — {new Date(v.viewedAt).toLocaleDateString()}</p>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Saved jobs</p>
          {dash.recentActivity.savedJobs.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.savedJobs.map((j) => (
            <p key={j._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{j.title} @ {j.company}</p>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Submitted applications</p>
          {dash.recentActivity.submittedApplications.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.submittedApplications.map((a) => (
            <p key={a._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{a.job?.title} @ {a.job?.company} — {new Date(a.createdAt).toLocaleDateString()}</p>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Updated CV/profile</p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
            {dash.recentActivity.cvLastUpdated ? `Last updated ${new Date(dash.recentActivity.cvLastUpdated).toLocaleDateString()}` : 'Never updated yet.'}
          </p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Recent interviews</p>
          {dash.recentActivity.recentInterviews.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.recentInterviews.map((i) => {
            const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
            return <p key={i._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{i.job?.title} @ {i.job?.company} — {new Date(i.scheduledDate).toLocaleDateString()} ({st.label})</p>;
          })}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Received offers</p>
          {dash.recentActivity.receivedOffers.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.receivedOffers.map((a) => (
            <p key={a._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{a.job?.title} @ {a.job?.company}</p>
          ))}
        </div>
      </div>

      {/* 13. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Search Jobs', key: 'search' },
          { label: 'Upload CV', key: 'resume' },
          { label: 'Build Resume', key: 'resume' },
          { label: 'View Applications', key: 'applications' },
          { label: 'Practice Interview', key: 'tools' },
          { label: 'Update Profile', key: 'resume' },
          { label: 'View Messages', key: 'messages' },
          { label: 'Set Job Alert', key: 'alerts' }
        ]}
        onNavigate={(key) => onNavigate?.(key)}
      />
    </>
  );
}

function JobSearchPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [q, setQ] = useState('');
  const [coverLetters, setCoverLetters] = useState({});
  const [viewingJob, setViewingJob] = useState(null);
  // Jobs already applied to (job id → application), so they show their stage instead of Apply.
  const [applied, setApplied] = useState({});
  const loadApplied = () => apiRequest('/jobs/mine/applications').then((list) => setApplied(Object.fromEntries(list.filter((a) => a.job).map((a) => [a.job._id || a.job, a])))).catch(() => {});

  function load() {
    apiRequest(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setJobs).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/saved').then((list) => setSavedIds(list.map((j) => j._id))).catch(() => {});
    loadApplied();
  }
  useEffect(load, []);

  async function apply(jobId) {
    try {
      await apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', body: { coverLetter: coverLetters[jobId] || '' } });
      onFlash('Application submitted.', 'success');
      loadApplied();
    } catch (err) { onFlash(err.message); }
  }

  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="job-search-workspace">
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="job-search-form">
        <input className="form-input" aria-label="Search jobs by title, company or skill" placeholder="Search by title, company or skill" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary"><FaMagnifyingGlass aria-hidden="true" /> Search</button>
      </form>
      {jobs === null && <p role="status" className="admin-notice">Loading...</p>}
      {jobs && jobs.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No open jobs found.</p>}
      <div className="grid grid-cols-1 gap-3">
        {(jobs || []).map((j) => {
          const isSaved = savedIds.includes(j._id);
          return (
            <div key={j._id} className="job-search-result">
              <div className="job-search-result-heading">
                <div className="job-search-result-identity">
                  <JobLogo job={j} />
                  <div><strong>{j.title}</strong><p className="text-xs text-[var(--ink-soft)]">{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'} · {j.type.replace('_', ' ')}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p></div>
                </div>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{formatSalary(j)}</span>
              </div>
              <div className="job-search-result-actions">
                {applied[j._id]
                  ? <span className="text-xs" style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--sand)', fontWeight: 600 }}>Applied {new Date(applied[j._id].createdAt).toLocaleDateString()} · {JOB_APP_STATUS[applied[j._id].status]?.label || applied[j._id].status}</span>
                  : <input className="form-input" placeholder="Cover letter (optional)" value={coverLetters[j._id] || ''} onChange={(e) => setCoverLetters({ ...coverLetters, [j._id]: e.target.value })} aria-label={`Cover letter for ${j.title} (optional)`} />}
                <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Job</button>
                {!applied[j._id] && <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => apply(j._id)}>Apply</button>}
                {!applied[j._id] && <a className="btn" href={`/jobs/${j._id}?action=apply`} style={{ padding: '6px 16px', fontSize: '0.8rem' }} title="Choose which CV to send, upload one or build one">Choose CV & apply</a>}
                <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>
              </div>
            </div>
          );
        })}
      </div>
      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        isSaved={viewingJob ? savedIds.includes(viewingJob._id) : false}
        onToggleSave={toggleSave}
        onApply={viewingJob && applied[viewingJob._id] ? null : (id) => { apply(id); setViewingJob(null); }}
      />
    </div>
  );
}

// Student sidebar — Internship Center (Part 10.9): browse + apply reuses the same Job
// infrastructure (Job.type = 'internship' already exists), with a dedicated "My Internships"
// application-status view so internships don't get lost inside the general Jobs search.
function InternshipsPanel({ onFlash }) {
  const [sub, setSub] = useUrlTab('internshipsPanel', 'browse');
  const [internships, setInternships] = useState(null);
  const [applications, setApplications] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);

  function load() {
    apiRequest('/jobs?type=internship').then(setInternships).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/saved').then((list) => setSavedIds(list.map((j) => j._id))).catch(() => {});
    apiRequest('/jobs/mine/applications').then((apps) => setApplications(apps.filter((a) => a.job?.type === 'internship'))).catch(() => setApplications([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function apply(jobId) {
    openApplyPage(jobId); // full job page: description, salary, choose / upload / build the CV
  }
  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    } catch (err) { onFlash(err.message); }
  }

  const appliedJobIds = new Set((applications || []).map((a) => a.job?._id));
  const completedCount = (applications || []).filter((a) => a.status === 'hired').length;

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaGraduationCap aria-hidden="true" size={16} /></span>
        <div>
          <h3 className="font-semibold" style={{ margin: 0 }}>Internships</h3>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{applications === null ? 'Loading...' : `${applications.length} applied · ${completedCount} completed`}</p>
        </div>
      </div>

      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'browse', label: 'Browse Internships' }, { key: 'applications', label: 'My Applications' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>

      {sub === 'browse' && (
        internships === null ? <p role="status" className="admin-notice">Loading...</p>
        : internships.length === 0 ? (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaGraduationCap aria-hidden="true" />
            <p>No internships posted yet</p>
            <span>Check back soon, or set a Job Alert for "internship" to get notified.</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {internships.map((j) => {
              const isSaved = savedIds.includes(j._id);
              const applied = appliedJobIds.has(j._id);
              return (
                <div key={j._id} className="hover-card card" style={{ padding: 16 }}>
                  <div className="flex items-start justify-between flex-wrap" style={{ gap: 12 }}>
                    <div className="flex items-start" style={{ gap: 12, minWidth: 0 }}>
                      <JobLogo job={j} />
                      <div style={{ minWidth: 0 }}>
                        <strong className="text-sm">{j.title}</strong>
                        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--ink-soft)', flexShrink: 0 }}>{formatSalary(j)}</span>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap" style={{ marginTop: 12 }}>
                    <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Details</button>
                    {applied
                      ? <Tag status="pending" label="Applied" />
                      : <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => apply(j._id)}>Apply</button>}
                    <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {sub === 'applications' && (
        applications === null ? <p role="status" className="admin-notice">Loading...</p>
        : applications.length === 0 ? (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaGraduationCap aria-hidden="true" />
            <p>No internship applications yet</p>
            <span>Browse internships and apply to see them here.</span>
          </div>
        ) : (
          <Table
            headers={['Internship', 'Company', 'Status', 'Applied']}
            rows={applications.map((a) => [
              a.job?.title, a.job?.company,
              <Tag status={JOB_APP_STATUS[a.status]?.tag} label={a.status === 'hired' ? 'Completed / Hired' : (JOB_APP_STATUS[a.status]?.label || a.status)} />,
              new Date(a.createdAt).toLocaleDateString()
            ])}
            empty="No internship applications yet."
          />
        )
      )}

      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        isSaved={viewingJob ? savedIds.includes(viewingJob._id) : false}
        onToggleSave={toggleSave}
        onApply={(id) => { apply(id); setViewingJob(null); }}
      />
    </div>
  );
}

function JobMyProfilePanel({ onFlash, onNavigate }) {
  const [dash, setDash] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;
  const p = dash.profile;
  const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };
  const notSet = <span style={{ color: 'var(--ink-soft)' }}>Not set</span>;
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="student-progress-row">
        <span>Profile completeness</span>
        <strong>{p.completeness}%</strong>
      </div>
      <progress className="student-progress-bar" max="100" value={p.completeness} aria-label="Profile completeness" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginTop: 20 }}>
        <div><p style={labelStyle}>Title</p><p className="text-sm" style={{ marginTop: 4 }}>{p.title || notSet}</p></div>
        <div><p style={labelStyle}>Location</p><p className="text-sm" style={{ marginTop: 4 }}>{p.location || notSet}</p></div>
        <div><p style={labelStyle}>Experience level</p><p className="text-sm" style={{ marginTop: 4 }}>{p.experienceLevel || notSet}</p></div>
        <div><p style={labelStyle}>LinkedIn</p><p className="text-sm" style={{ marginTop: 4 }}>{p.linkedinUrl ? <a href={p.linkedinUrl} target="_blank" rel="noreferrer">{p.linkedinUrl}</a> : <span style={{ color: 'var(--ink-soft)' }}>Not added yet</span>}</p></div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)' }}>
        <p style={labelStyle}>Skills</p>
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
          {p.skills.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>None added yet</span>}
          {p.skills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)' }}>{s}</span>)}
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div>
          <p style={labelStyle}>Education</p>
          {p.education.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
          {p.education.map((ed, i) => <p key={i} className="text-xs" style={{ marginTop: 6 }}>{ed.degree} — {ed.institution} ({ed.year})</p>)}
        </div>
        <div>
          <p style={labelStyle}>Experience</p>
          {p.experience.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
          {p.experience.map((ex, i) => <p key={i} className="text-xs" style={{ marginTop: 6 }}>{ex.title} at {ex.company} ({ex.duration})</p>)}
        </div>
        <div>
          <p style={labelStyle}>Certifications</p>
          <p className="text-xs" style={{ marginTop: 6, color: p.certifications.length ? 'var(--ink)' : 'var(--ink-soft)' }}>{p.certifications.length > 0 ? p.certifications.join(', ') : 'None added yet'}</p>
        </div>
      </div>

      <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', marginTop: 20 }} onClick={() => onNavigate?.('resume')}>Edit Profile</button>
    </div>
  );
}

function RecommendedJobsPanel({ onFlash }) {
  const [dash, setDash] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);

  function load() { apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function apply(jobId) {
    openApplyPage(jobId); // full job page: description, salary, choose / upload / build the CV
  }
  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-3">
      {dash.recommendedJobs.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No recommendations yet — add skills to your CV to get matched jobs.</p>}
      {dash.recommendedJobs.map((j) => {
        const isSaved = savedIds.includes(j._id) || dash.savedJobs.some((s) => s._id === j._id);
        return (
          <div key={j._id} className="border border-[var(--sand-line)] rounded-xl p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-start gap-3">
                <JobLogo job={j} />
                <div>
                  <strong className="text-sm">{j.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'} · {j.type?.replace('_', ' ')}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{formatSalary(j)} · {j.experienceYears || 0}+ yrs exp · Posted {new Date(j.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Job</button>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>
                <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => apply(j._id)}>Apply Now</button>
              </div>
            </div>
          </div>
        );
      })}
      <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} isSaved={viewingJob ? (savedIds.includes(viewingJob._id) || dash.savedJobs.some((s) => s._id === viewingJob._id)) : false} onToggleSave={toggleSave} onApply={(id) => { apply(id); setViewingJob(null); }} />
    </div>
  );
}

// Real employment offer/acceptance/resignation (spec: Student/Teacher<->Employer "offer
// acceptance/rejection, employment contract, employee onboarding, salary/employment record") —
// created automatically once an employer marks an application "hired" (Employment.js).
function JobOffersPanel({ onFlash }) {
  const [employments, setEmployments] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() { apiRequest('/employment/mine').then(setEmployments).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);

  async function respond(id, decision) {
    const signedName = decision === 'accepted' ? await showPrompt('Type your full name. This is your digital signature accepting the offer.', { title: 'Sign and accept offer', placeholder: 'Your full name', confirmLabel: 'Sign and accept', required: true }) : '';
    if (decision === 'accepted' && !signedName) return;
    setBusyId(id);
    try {
      await apiRequest(`/employment/${id}/respond`, { method: 'PATCH', body: { decision, signedName } });
      onFlash(`Offer ${decision}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  async function resignFrom(id) {
    const reason = await showPrompt('You can add a reason for your resignation, or continue without one.', { title: 'Resign from employment', placeholder: 'Reason (optional)', confirmLabel: 'Submit resignation', danger: true });
    if (reason === null) return;
    setBusyId(id);
    try {
      await apiRequest(`/employment/${id}/resign`, { method: 'POST', body: { reason } });
      onFlash('Resignation recorded.', 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  if (employments === null) return <p role="status" className="admin-notice">Loading...</p>;
  const pending = employments.filter((e) => e.status === 'offered');
  const history = employments.filter((e) => e.status !== 'offered');
  const STATUS_TAG = { active: 'approved', accepted: 'approved', declined: 'rejected', resigned: 'pending', terminated: 'rejected' };

  return (
    <div>
      {pending.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong className="text-sm">Pending Offers</strong>
          {pending.map((e) => (
            <div key={e._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sand-line)' }}>
              <div>
                <strong className="text-sm">{e.job?.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.job?.company}{e.salary ? ` · ${e.currency} ${Number(e.salary).toLocaleString()}${e.offer?.salaryPeriod ? ` per ${e.offer.salaryPeriod}` : ''}` : ''}{e.startDate ? ` · joining ${new Date(e.startDate).toLocaleDateString()}` : ''}{e.offer?.expiresAt ? ` · reply by ${new Date(e.offer.expiresAt).toLocaleDateString()}` : ''}</p>
                {e.offer?.terms && <p className="text-xs" style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0' }}>Terms: {e.offer.terms}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => respond(e._id, 'accepted')}>Accept</button>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => respond(e._id, 'declined')}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Table
        headers={['Job', 'Company', 'Status', 'Started', 'Ended', 'Action']}
        rows={history.map((e) => [
          e.job?.title, e.job?.company, <Tag status={STATUS_TAG[e.status] || 'pending'} label={e.status} />,
          e.startDate ? new Date(e.startDate).toLocaleDateString() : '—',
          e.endedAt ? `${new Date(e.endedAt).toLocaleDateString()}${e.endReason ? ` (${e.endReason})` : ''}` : '—',
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {e.offerLetter?.sentAt && <ViewOfferLetterButton employment={e} candidate={session.getUser()?.fullName} onFlash={onFlash} />}
            {e.status === 'accepted' && !e.offerLetter?.sentAt && <small style={{ color: 'var(--ink-soft)' }}>Waiting for the offer letter</small>}
            {e.status === 'active' && <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => resignFrom(e._id)}>Resign</button>}
          </span>
        ])}
        empty="No job offers yet."
      />
    </div>
  );
}

// Real Institution<->Employer placement referrals (spec: "campus recruitment/student referrals")
// — never auto-applies; the student reviews and applies themselves.
function StudentReferralsPanel({ onFlash }) {
  const [referrals, setReferrals] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() { apiRequest('/institution-employer/referrals/mine').then(setReferrals).catch(err => onFlash(err.message)); }
  useEffect(load, []);

  async function apply(id) {
    setBusyId(id);
    try { await apiRequest(`/institution-employer/referrals/${id}/apply`, { method: 'POST' }); onFlash('Applied.', 'success'); load(); } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  const STATUS_TAG = { referred: 'pending', applied: 'pending', hired: 'approved', declined: 'rejected' };

  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>Your institution recommended you for these — nothing is submitted until you apply yourself.</p>
      <Table
        loading={referrals === null}
        headers={['Job', 'Institution', 'Referral', 'Application', 'Action']}
        rows={(referrals || []).map((r) => [
          `${r.job?.title} @ ${r.job?.company}`, r.institution?.name, <Tag status={STATUS_TAG[r.status] || 'pending'} label={r.status} />, r.applicationStatus || 'Not applied',
          r.status === 'referred' ? <><button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} disabled={busyId === r._id} onClick={() => apply(r._id)}>Apply</button><button className="btn" disabled={busyId === r._id} onClick={async () => { setBusyId(r._id); try { await apiRequest('/institution-employer/referrals/' + r._id + '/decline', { method: 'PATCH' }); onFlash('Referral declined.', 'success'); load(); } catch(e) { onFlash(e.message); } finally { setBusyId(null); } }}>Decline</button></> : '—'
        ])}
        empty="No referrals yet."
      />
      <PartnerJobsForStudent />
    </div>
  );
}

// Open jobs from employers that signed a partnership MoU with the student's institute.
function PartnerJobsForStudent() {
  const [jobs, setJobs] = useState(null);
  useEffect(() => { apiRequest('/institution-employer/partner-jobs/mine').then(setJobs).catch(() => setJobs([])); }, []);
  if (!jobs?.length) return null;
  return (
    <section className="partner-jobs">
      <h3>Jobs from your institute's partner employers</h3>
      <p>These employers signed a partnership with your institute. Apply yourself, or ask your placement office to refer you.</p>
      <div className="partner-job-cards">
        {jobs.map((j) => (
          <article key={j._id} className="card partner-job-card">
            <strong>{j.title}</strong>
            <small>{j.company}{j.city ? ` · ${j.city}` : ''} · {String(j.type || '').replace('_', ' ')}</small>
            {(j.salaryMin || j.salaryMax) && <small>{j.currency} {[j.salaryMin, j.salaryMax].filter(Boolean).map((n) => Number(n).toLocaleString()).join(' – ')}</small>}
            <span className="referred-badge">Partner of {j.via}</span>
            <a className="btn btn-primary" href={`/jobs/${j._id}`}>View and apply</a>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortfolioPanel({ onFlash, onNavigate }) { // eslint-disable-line no-unused-vars
  const [dash, setDash] = useState(null);
  const loadDash = () => apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message));
  useEffect(() => { loadDash(); }, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;
  return (
    <div>
      {dash.profile.portfolio.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 16 }}>
          <FaBriefcase aria-hidden="true" />
          <p>No portfolio projects added yet</p>
          <span>Add project links with a title and description — shown on your CV.</span>
        </div>
      )}
      <PortfolioEditor projects={dash.profile.portfolio} onSaved={loadDash} onFlash={onFlash} />
    </div>
  );
}

function SavedJobsPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  function load() { apiRequest('/jobs/mine/saved').then(setJobs).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function remove(id) {
    try { await apiRequest(`/jobs/${id}/save`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function apply(id) {
    openApplyPage(id); // full job page: description, salary, choose / upload / build the CV
  }

  return (
    <Table
      loading={jobs === null}
      headers={['Job', 'Company', 'Type', 'Action']}
      rows={(jobs || []).map((j) => [
        j.title, j.company, j.type?.replace('_', ' '),
        <div className="flex gap-2">
          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => apply(j._id)}>Apply</button>
          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => remove(j._id)}>Remove</button>
        </div>
      ])}
      empty="No saved jobs yet."
    />
  );
}

function MyApplicationsPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  const [reviews, reloadReviews] = useCompanyReviewLookup();
  const load = () => apiRequest('/jobs/mine/applications').then(setApplications).catch((err) => onFlash(err.message));
  useEffect(() => { load(); }, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps
  async function act(a, action) {
    try {
      await apiRequest(`/jobs/applications/${a._id}/${action}`, { method: 'POST', body: {} });
      onFlash(action === 'confirm-joining' ? 'Thank you. Your joining is confirmed.' : 'Application withdrawn.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function answer(e, decision) {
    if (decision === 'declined' && !window.confirm('Decline this offer? Your application will be withdrawn.')) return;
    const signedName = decision === 'accepted' ? await showPrompt('Type your full name. This is your digital signature accepting the offer.', { title: 'Sign and accept offer', placeholder: 'Your full name', confirmLabel: 'Sign and accept', required: true }) : '';
    if (decision === 'accepted' && !signedName) return;
    try { await apiRequest(`/employment/${e._id}/respond`, { method: 'PATCH', body: { decision, signedName } }); onFlash(decision === 'accepted' ? 'Offer accepted. The employer will send your offer letter.' : 'Offer declined.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  // The offer, right where the candidate sees the Offer stage.
  function offerCell(a) {
    const e = a.employment;
    if (e?.offer?.sentAt && e.status === 'offered') return (
      <div style={{ display: 'grid', gap: 6 }}>
        <span className="text-xs"><strong>{e.currency} {Number(e.salary).toLocaleString()}</strong> per {e.offer.salaryPeriod || 'month'}{e.startDate ? ` · joining ${new Date(e.startDate).toLocaleDateString()}` : ''}{e.offer.expiresAt ? ` · reply by ${new Date(e.offer.expiresAt).toLocaleDateString()}` : ''}</span>
        {e.offer.terms && <span className="text-xs" style={{ whiteSpace: 'pre-wrap', color: 'var(--ink-soft)' }}>{e.offer.terms}</span>}
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {e.offerLetter?.sentAt && <ViewOfferLetterButton employment={e} candidate={session.getUser()?.fullName} onFlash={onFlash} />}
          <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => answer(e, 'accepted')}>Accept offer</button>
          <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => answer(e, 'declined')}>Decline</button>
        </span>
      </div>
    );
    if (a.status === 'selected' && !e?.offer?.sentAt) return <small style={{ color: 'var(--ink-soft)' }}>You are selected. The employer will send the offer details (salary, joining date) here.</small>;
    if (e?.offerLetter?.sentAt) return <ViewOfferLetterButton employment={e} candidate={session.getUser()?.fullName} onFlash={onFlash} />;
    if (e?.status === 'accepted') return <small style={{ color: 'var(--ink-soft)' }}>Offer accepted ({e.currency} {Number(e.salary).toLocaleString()}){e.signature?.name ? `, signed by ${e.signature.name}` : ''}. Waiting for the offer letter.</small>;
    return null;
  }

  return (
    <Table
      loading={applications === null}
      headers={['Job', 'Company', 'Stage', 'Applied', 'Action', 'Messages']}
      rows={(applications || []).map((a) => [
        a.job ? <a href={`/jobs/${a.job._id}`}>{a.job.title}</a> : '—', a.job?.company,
        <Tag status={JOB_APP_STATUS[a.status]?.tag} label={JOB_APP_STATUS[a.status]?.label || a.status} />,
        new Date(a.createdAt).toLocaleDateString(),
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>{offerCell(a) || (a.status === 'hired' && !a.joining?.confirmed
          ? <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => act(a, 'confirm-joining')}>Confirm I joined</button>
          : !['hired', 'completed', 'rejected', 'withdrawn'].includes(a.status)
            ? <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => act(a, 'withdraw')}>Withdraw</button>
            : reviews.get(String(a._id)) ? null : '—')}<ReviewCompanyButton item={reviews.get(String(a._id))} onFlash={onFlash} onDone={reloadReviews} /></span>,
        <ApplicationThread key={a._id} applicationId={a._id} count={a.messageCount} onFlash={onFlash} />
      ])}
      empty="No applications yet."
    />
  );
}

// Categorizes the shared /messages/conversations feed by the other person's real role —
// there's no separate "recruiter" role in this system, so education_agent (who can also post
// jobs, per job.controller's isRoleVerified check) is the honest stand-in for it.
function JobMessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [interviews, setInterviews] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/interviews').then(setInterviews).catch(() => setInterviews([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || interviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  const hasRole = (u, role) => (u.roles || []).includes(role);
  const employerMsgs = conversations.filter((c) => hasRole(c.user, 'employer'));
  const recruiterMsgs = conversations.filter((c) => hasRole(c.user, 'education_agent'));
  const supportMsgs = conversations.filter((c) => hasRole(c.user, 'admin') || hasRole(c.user, 'super_admin') || hasRole(c.user, 'platform_staff'));
  const categorizedIds = new Set([...employerMsgs, ...recruiterMsgs, ...supportMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const msgLabelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={msgLabelStyle}>{title}</p>
        <div className="dash-list" style={{ marginTop: 10 }}>
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex items-center justify-between">
          <strong className="text-sm">Unread messages</strong>
          <strong style={{ fontSize: 24, fontFamily: 'Fraunces, serif' }}>{totalUnread}</strong>
        </div>
      </div>
      <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
        <div>
          <div className="border border-[var(--sand-line)] rounded-xl p-4" style={{ marginBottom: 16 }}>
            <p style={msgLabelStyle}>Interview invitations</p>
            {interviews.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
            {interviews.slice(0, 5).map((i) => {
              const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
              return <p key={i._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{i.job?.title} @ {i.job?.company} — {new Date(i.scheduledDate).toLocaleDateString()} ({st.label})</p>;
            })}
          </div>
          <ConversationGroup title="Employer / company messages" items={employerMsgs} />
          <ConversationGroup title="Recruiter messages" items={recruiterMsgs} />
          <ConversationGroup title="Support messages" items={supportMsgs} />
          <ConversationGroup title="Other messages" items={otherMsgs} />
          {conversations.length === 0 && (
            <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
              <FaCommentDots aria-hidden="true" />
              <p>No conversations yet</p>
              <span>Employers message you here once you apply.</span>
            </div>
          )}
        </div>
        <div className="border border-[var(--sand-line)] rounded-xl p-4">
          <h3 className="font-semibold mb-2">{activeUser ? activeUser.fullName : 'Select a conversation'}</h3>
          {!activeUser && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pick a conversation on the left to view and reply to messages.</p>}
          {activeUser && (
            <>
              <div className="card reveal in" style={{ padding: '8px 12px', marginBottom: 12, maxHeight: 320, overflowY: 'auto' }}>
                {thread === null && <p role="status" className="admin-notice">Loading...</p>}
                {thread && thread.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No messages yet.</p>}
                {(thread || []).map((m) => (
                  <div key={m._id} style={{ padding: '8px 4px', borderBottom: '1px solid var(--sand-line)' }}>
                    <div style={{ fontSize: 13 }}>{m.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
                <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InterviewsPanel({ onFlash }) {
  const [interviews, setInterviews] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/interviews').then(setInterviews).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (interviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Upcoming Interviews</h3>
      {interviews.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No interviews scheduled. Employers schedule these once you're shortlisted.</p>}
      {interviews.map((i) => {
        const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
        return (
          <div key={i._id} className="border border-[var(--sand-line)] rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <strong className="text-sm">{i.job?.title}{i.round === 'final_interview' ? ' · Final interview' : ''}</strong>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{i.job?.company}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                  {new Date(i.scheduledDate).toLocaleDateString()} · {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{i.mode === 'physical' ? `Physical — ${i.location || 'location TBD'}` : 'Online on CareerZ (video room opens 15 minutes before)'}</p>
                <Tag status={st.tag} label={st.label} />
              </div>
              {i.mode === 'online' && i.status === 'scheduled'
                ? <InterviewJoin interview={i} />
                : <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => recordJobView(i.job, setViewingJob)}>View Details</button>}
            </div>
          </div>
        );
      })}
      <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} />
    </div>
  );
}

function JobAlertsPanel({ onFlash }) {
  const [alerts, setAlerts] = useState(null);
  const [form, setForm] = useState({ keywords: '', country: '', city: '', remoteOnly: false, governmentOnly: false, internationalOnly: false, salaryMin: '' });

  function load() { apiRequest('/job-alerts/mine').then(setAlerts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/job-alerts', { method: 'POST', body: { ...form, country: form.country.toUpperCase(), salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined } });
      onFlash('Job alert saved.', 'success');
      setForm({ keywords: '', country: '', city: '', remoteOnly: false, governmentOnly: false, internationalOnly: false, salaryMin: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(id) {
    try { await apiRequest(`/job-alerts/${id}`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Job Alerts</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Save a search once — we'll show how many currently-open jobs match it every time you check.</p>
      <form onSubmit={create} className="border border-[var(--sand-line)] rounded-xl p-4" style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <input className="form-input" placeholder="Keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} style={{ flex: '2 1 220px', minWidth: 0 }} />
          <input className="form-input" placeholder="Country code" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={{ flex: '1 1 110px', minWidth: 0 }} />
          <input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
          <input className="form-input" type="number" placeholder="Min salary" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} style={{ flex: '1 1 120px', minWidth: 0 }} />
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: 18 }}>
          <label className="flex items-center text-xs" style={{ gap: 6 }}><input type="checkbox" checked={form.remoteOnly} onChange={(e) => setForm({ ...form, remoteOnly: e.target.checked })} /> Remote only</label>
          <label className="flex items-center text-xs" style={{ gap: 6 }}><input type="checkbox" checked={form.governmentOnly} onChange={(e) => setForm({ ...form, governmentOnly: e.target.checked })} /> Government only</label>
          <label className="flex items-center text-xs" style={{ gap: 6 }}><input type="checkbox" checked={form.internationalOnly} onChange={(e) => setForm({ ...form, internationalOnly: e.target.checked })} /> International (visa sponsorship)</label>
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', justifySelf: 'start' }}>Save Alert</button>
      </form>
      <Table
        loading={alerts === null}
        headers={['Keywords', 'Location', 'Filters', 'Matching Jobs Now', 'Action']}
        rows={(alerts || []).map((a) => [
          a.keywords || 'Any', [a.city, a.country].filter(Boolean).join(', ') || 'Any', [a.remoteOnly && 'Remote', a.governmentOnly && 'Government', a.internationalOnly && 'International', a.salaryMin && `Min ${a.salaryMin}`].filter(Boolean).join(', ') || '—',
          a.matchCount, <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => remove(a._id)}>Remove</button>
        ])}
        empty="No saved alerts yet."
      />
    </div>
  );
}

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (ChatGPT)' },
  { value: 'claude', label: 'Anthropic (Claude)' },
  { value: 'gemini', label: 'Google (Gemini)' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'local', label: 'Local AI (your own server: Ollama, LM Studio…)' }
];

const AI_PURPOSES = [
  { key: 'text', label: 'Text (notes, quiz, career advice...)', providers: AI_PROVIDERS },
  { key: 'image', label: 'Images / Graphics', providers: [{ value: 'openai', label: 'OpenAI (DALL-E)' }, { value: 'stability', label: 'Stability AI' }] },
  { key: 'threed', label: '3D Models', providers: [{ value: 'meshy', label: 'Meshy AI' }] },
  { key: 'voice', label: 'Voice (narration)', providers: [{ value: 'elevenlabs', label: 'ElevenLabs' }, { value: 'google', label: 'Google Cloud TTS (free tier)' }] },
  { key: 'avatar', label: 'Avatar Video', providers: [{ value: 'heygen', label: 'HeyGen' }] },
  { key: 'animation', label: 'Animation', providers: [{ value: 'runway', label: 'Runway ML' }] }
];

// Real BYOK AI settings (spec Part 14/17E, "AI Creative Teacher" Part 15B.6-15B.7) — CareerZ
// never supplies or bills AI itself. Each row below is a different AI category (text, image, 3D,
// voice, avatar-video) — connect only the ones you actually want to use, independently.
function AiSettingsPanel({ onFlash, onChanged, purposes = AI_PURPOSES, institutionId }) {
  const [status, setStatus] = useState(null);
  const [forms, setForms] = useState({});
  const [saving, setSaving] = useState(null);

  const configPath = institutionId ? `/ai/institutions/${institutionId}/config` : '/ai/config';
  function load() { apiRequest(configPath).then(setStatus).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  function formFor(purposeKey) {
    return forms[purposeKey] || { provider: purposes.find((p) => p.key === purposeKey)?.providers[0]?.value, apiKey: '' };
  }

  async function save(purposeKey, e) {
    e.preventDefault();
    const f = formFor(purposeKey);
    setSaving(purposeKey);
    try {
      await apiRequest(configPath, { method: 'PUT', body: { purpose: purposeKey, provider: f.provider, apiKey: f.apiKey, ...(f.provider === 'local' ? { baseUrl: f.baseUrl, model: f.model } : {}) } });
      onFlash('AI provider connected.', 'success');
      setForms((prev) => ({ ...prev, [purposeKey]: { ...f, apiKey: '' } }));
      load();
      onChanged?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(null); }
  }

  async function remove(purposeKey) {
    try {
      await apiRequest(`${configPath}/${purposeKey}`, { method: 'DELETE' });
      onFlash('AI provider disconnected.', 'success');
      load();
      onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  if (!status) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="card ai-provider-settings" style={{ padding: 20, marginBottom: 24 }}>
      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>AI Provider Settings</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
        Bring your own API key per category below — CareerZ only connects to it, it never pays for or supplies AI itself. You're billed directly by whichever provider you choose. Connect only what you'll actually use.
      </p>
      <div className="space-y-3 ai-provider-list">
        {purposes.map((p) => {
          const s = status[p.key] || { configured: false };
          const f = formFor(p.key);
          return (
            <div className="ai-provider-row" key={p.key} style={{ paddingBottom: 10, borderBottom: '1px solid var(--sand-line)' }}>
              <p className="text-xs font-semibold mb-2">{p.label}</p>
              {s.configured ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag status="approved" label={`Connected: ${p.providers.find((x) => x.value === s.provider)?.label || s.provider}${s.provider === 'local' && s.baseUrl ? ` at ${s.baseUrl} · ${s.model}` : ''}${s.keyPreview ? ` (${s.keyPreview})` : ''}`} />
                  <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => remove(p.key)}>Disconnect</button>
                </div>
              ) : (
                <form onSubmit={(e) => save(p.key, e)} className="flex gap-2 flex-wrap items-end">
                  <CustomSelect value={f.provider} onChange={(v) => setForms((prev) => ({ ...prev, [p.key]: { ...f, provider: v } }))} ariaLabel={`${p.label} provider`} minWidth={170} options={p.providers} />
                  {f.provider === 'local' && <>
                    <input type="url" className="form-input" aria-label="Local AI server address" placeholder="Server address, e.g. https://ai.myschool.edu/v1" value={f.baseUrl || ''} onChange={(e) => setForms((prev) => ({ ...prev, [p.key]: { ...f, baseUrl: e.target.value } }))} required style={{ minWidth: 260, fontSize: '0.8rem' }} />
                    <input className="form-input" aria-label="Model name" placeholder="Model, e.g. llama3.1" value={f.model || ''} onChange={(e) => setForms((prev) => ({ ...prev, [p.key]: { ...f, model: e.target.value } }))} required style={{ minWidth: 150, fontSize: '0.8rem' }} />
                  </>}
                  <input type="password" className="form-input" aria-label="API key" placeholder={f.provider === 'local' ? 'API key (if your server needs one)' : 'Your API key'} value={f.apiKey} onChange={(e) => setForms((prev) => ({ ...prev, [p.key]: { ...f, apiKey: e.target.value } }))} required={f.provider !== 'local'} style={{ minWidth: 200, fontSize: '0.8rem' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={saving === p.key}>{saving === p.key ? 'Saving...' : 'Connect'}</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// One AI-powered tool, real end to end — calls the user's own connected provider via
// POST /ai/generate. Disabled until AiSettingsPanel reports a provider connected.
// Inline **bold** markdown -> <strong>; every other AI-formatting need is handled by the
// block-level parser below, so this only ever has to deal with one inline pattern.
function renderAiInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    return m ? <strong key={idx}>{m[1]}</strong> : <span key={idx}>{part}</span>;
  });
}

// Turns a free-text AI response (numbered "N) Heading" sections, "- bullet" / nested "  - bullet"
// lists, "Short Label:" sub-headers, and plain paragraphs) into real block elements instead of
// one unstyled wall of text. Deliberately regex-based, not a markdown lib: AI providers are not
// consistent enough about markdown syntax for a strict parser to be worth the dependency.
function parseAiBlocks(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { i++; continue; }

    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      const items = [];
      while (i < lines.length) {
        const bm = lines[i].match(/^(\s*)[-*]\s+(.+)$/);
        if (!bm) break;
        const text = bm[2].trim();
        if (bm[1].length >= 2 && items.length) items[items.length - 1].sub.push(text);
        else items.push({ text, sub: [] });
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    const headingMatch = trimmed.match(/^\d+[).]\s+(.+)$/);
    if (headingMatch) { blocks.push({ type: 'heading', text: headingMatch[1] }); i++; continue; }
    if (/^[A-Za-z][^.?!]{0,70}:$/.test(trimmed)) { blocks.push({ type: 'heading', text: trimmed.slice(0, -1) }); i++; continue; }

    let para = trimmed;
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^(\s*)[-*]\s+/) && !lines[i].trim().match(/^\d+[).]\s+/)) {
      para += ' ' + lines[i].trim();
      i++;
    }
    blocks.push({ type: 'para', text: para });
  }
  return blocks;
}

function AiTextBlock({ text }) {
  const blocks = parseAiBlocks(text);
  return (
    <div className="ai-result-body">
      {blocks.map((b, idx) => {
        if (b.type === 'heading') return <h5 key={idx} className="ai-result-heading">{renderAiInline(b.text)}</h5>;
        if (b.type === 'list') return (
          <ul key={idx} className="ai-result-list">
            {b.items.map((it, j) => (
              <li key={j}>
                {renderAiInline(it.text)}
                {it.sub.length > 0 && <ul>{it.sub.map((s, k) => <li key={k}>{renderAiInline(s)}</li>)}</ul>}
              </li>
            ))}
          </ul>
        );
        return <p key={idx} className="ai-result-para">{renderAiInline(b.text)}</p>;
      })}
    </div>
  );
}

function isAiQuizText(text) {
  const matches = text.match(/^Question\s*\d+[:.]/gim);
  return !!matches && matches.length >= 2;
}

function parseAiQuiz(text) {
  return text.split(/(?=^Question\s*\d+[:.])/gim).map((s) => s.trim()).filter(Boolean).map((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const question = (lines[0] || '').replace(/^Question\s*\d+[:.]\s*/i, '');
    const options = [];
    let answerLetter = '';
    for (let i = 1; i < lines.length; i++) {
      const optMatch = lines[i].match(/^([A-D])[).]\s*(.+)$/i);
      if (optMatch) { options.push({ letter: optMatch[1].toUpperCase(), text: optMatch[2] }); continue; }
      const ansMatch = lines[i].match(/^Answer\s*:\s*([A-D])/i);
      if (ansMatch) answerLetter = ansMatch[1].toUpperCase();
    }
    return { number: idx + 1, question, options, answerLetter };
  });
}

function AiQuizBlock({ text }) {
  const questions = parseAiQuiz(text);
  const [revealed, setRevealed] = useState(() => new Set());
  function toggle(idx) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }
  return (
    <div className="ai-quiz-body">
      {questions.map((q, idx) => (
        <div key={idx} className="ai-quiz-question">
          <span className="ai-quiz-qnum">Question {q.number}</span>
          <p className="ai-quiz-qtext">{renderAiInline(q.question)}</p>
          <ul className="ai-quiz-options">
            {q.options.map((opt) => (
              <li key={opt.letter} className={revealed.has(idx) && opt.letter === q.answerLetter ? 'ai-quiz-correct' : ''}>
                <span className="ai-quiz-optletter">{opt.letter}</span>
                {renderAiInline(opt.text)}
              </li>
            ))}
          </ul>
          {q.answerLetter && (
            <button type="button" className="ai-quiz-reveal" onClick={() => toggle(idx)}>
              {revealed.has(idx) ? <><FaCircleCheck /> Answer: {q.answerLetter}</> : <><FaEye /> Show Answer</>}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Lets a teacher review/edit an AI draft, then publish it into one of their own classes (saved
// as a real Lesson, so it shows up in the student's course view the same as any lesson) — never
// auto-publishes the raw AI output untouched. Emails every actively enrolled, fee-cleared student
// that a new lecture was shared; a student with a pending institution fee is skipped, matching the
// same gate the student's own course view already enforces (getCourse, course.controller.js).
function ShareAiToClassButton({ title: defaultTitle, content: defaultContent, defaultCourseId }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [courses, setCourses] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  function openReview() {
    setOpen(true);
    setTitle(defaultTitle);
    setContent(defaultContent);
    if (courses) return;
    apiRequest('/courses/mine/list').then((list) => {
      setCourses(list);
      if (list.length > 0) setCourseId(list.some((c) => c._id === defaultCourseId) ? defaultCourseId : list[0]._id);
    }).catch(() => setCourses([]));
  }

  async function share() {
    if (!courseId || !title.trim() || !content.trim()) return;
    setBusy(true); setStatus('');
    try {
      const { notifiedCount, feeBlockedCount } = await apiRequest(`/courses/${courseId}/ai-resource`, { method: 'POST', body: { title, content } });
      const feeNote = feeBlockedCount > 0 ? ` (${feeBlockedCount} skipped — pending fee)` : '';
      setStatus(`Published to class — ${notifiedCount} student${notifiedCount === 1 ? '' : 's'} notified${feeNote}.`);
    } catch (err) { setStatus(err.message); } finally { setBusy(false); }
  }

  if (!open) {
    return (
      <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={openReview}>
        <FaPaperPlane aria-hidden="true" /> Review &amp; Share with Students
      </button>
    );
  }

  return (
    <div style={{ marginTop: 10, padding: 12, background: 'var(--sand)', borderRadius: 10 }}>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>Review and edit before publishing — this is exactly what students will see.</p>
      <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>Title</label>
      <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>Content</label>
      <textarea className="form-input" rows={8} value={content} onChange={(e) => setContent(e.target.value)} style={{ marginBottom: 10 }} />

      {courses === null && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Loading your classes...</p>}
      {courses?.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>You have no classes yet — create a course first.</p>}
      {courses?.length > 0 && (
        <>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Publish to which class?</label>
          <select className="form-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
          <div className="flex gap-2" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={share} disabled={busy}>{busy ? 'Publishing...' : 'Publish to Course'}</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </>
      )}
      {status && <p className="text-xs" style={{ marginTop: 8, color: status.startsWith('Published') ? 'var(--emerald)' : 'var(--rose)' }}>{status}</p>}
    </div>
  );
}

function AiResultView({ text, shareTitle, courseId }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    try { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  }
  return (
    <div className="ai-result-card">
      <div className="ai-result-header">
        <span className="ai-result-badge"><FaWandMagicSparkles /> AI Generated</span>
        <button type="button" className="ai-result-copy" onClick={copy}>{copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}</button>
      </div>
      {isAiQuizText(text) ? <AiQuizBlock text={text} /> : <AiTextBlock text={text} />}
      {shareTitle && <ShareAiToClassButton title={shareTitle} content={text} defaultCourseId={courseId} />}
    </div>
  );
}

function AiFeatureCard({ feature, title, description, placeholder, aiEnabled, shareable, institutionId, courseId, lockedReason }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [askedFor, setAskedFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult('');
    try {
      const { result: text } = await apiRequest('/ai/generate', { method: 'POST', body: { feature, prompt, institutionId: institutionId || undefined, courseId: courseId || undefined } });
      setResult(text);
      setAskedFor(prompt);
      setPrompt('');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: 18, alignSelf: 'start' }}>
      <strong className="text-sm">{title}</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{description}</p>
      {!open ? (
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => setOpen(true)} disabled={!aiEnabled || !!lockedReason}>
          {lockedReason || (aiEnabled ? 'Open' : 'Connect an AI provider above first')}
        </button>
      ) : (
        <form onSubmit={generate} style={{ marginTop: 12 }}>
          <textarea className="form-input" rows={3} placeholder={placeholder} value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <div className="flex gap-2" style={{ marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setOpen(false)}>Close</button>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 8 }}>{error}</p>}
          {result && <AiResultView text={result} shareTitle={shareable ? `${title}: ${askedFor.slice(0, 60)}` : null} courseId={courseId} />}
        </form>
      )}
    </div>
  );
}


function deckFileName(title, extension) {
  const safe = String(title || 'slide-deck').trim().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80) || 'slide-deck';
  return `${safe}.${extension}`;
}

async function imageSourceToDataUrl(source) {
  if (!source || source.startsWith('data:')) return source || '';
  const response = await fetch(source);
  if (!response.ok) throw new Error('Could not download a slide image.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function downloadDeckAsPptx(title, slides) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'CareerZ.pk';
  pptx.subject = title;
  pptx.title = title;
  for (const slideData of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: (slideData.background || '#fff8e7').slice(1) };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: (slideData.accent || '#d97706').slice(1) }, line: { color: (slideData.accent || '#d97706').slice(1) } });
    const hasImage = Boolean(slideData.imageUrl || slideData.image);
    slide.addText(slideData.title || '', { x: 0.65, y: 0.45, w: hasImage ? 7.1 : 12, h: 0.75, fontFace: 'Aptos Display', fontSize: 27, bold: true, color: (slideData.text || '#1f2937').slice(1), margin: 0 });
    slide.addText((slideData.bullets || []).map((text) => ({ text, options: { bullet: { indent: 18 } } })), { x: 0.78, y: 1.55, w: hasImage ? 6.8 : 11.7, h: 5.15, fontFace: 'Aptos', fontSize: 18, breakLine: true, color: (slideData.text || '#1f2937').slice(1), margin: 0.08, valign: 'top' });
    if (hasImage) {
      try {
        const data = await imageSourceToDataUrl(slideData.imageUrl || slideData.image);
        slide.addImage({ data, x: 8.15, y: 1.45, w: 4.5, h: 4.5, sizing: 'contain' });
      } catch { /* deck remains usable if a remote image blocks cross-origin download */ }
    }
  }
  await pptx.writeFile({ fileName: deckFileName(title, 'pptx') });
}

async function downloadDeckAsPdf(title, slides) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const brandResponse = await fetch('/logo2.png');
  if (!brandResponse.ok) throw new Error('Could not load presentation logo.');
  const brandLogo = await imageSourceToDataUrl('/logo2.png');
  for (let index = 0; index < slides.length; index++) {
    if (index > 0) pdf.addPage('a4', 'landscape');
    const slide = slides[index];
    const bg = slide.background || '#fff8e7';
    const accent = slide.accent || '#d97706';
    const text = slide.text || '#1f2937';
    pdf.setFillColor(bg); pdf.rect(0, 0, 842, 595, 'F');
    pdf.setFillColor(accent); pdf.rect(0, 0, 842, 12, 'F');
    pdf.setFillColor('#ffffff'); pdf.roundedRect(710, 14, 120, 60, 4, 4, 'F');
    pdf.addImage(brandLogo, 'PNG', 720, 17, 100, 53);
    pdf.setTextColor(text); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(27);
    pdf.text(pdf.splitTextToSize(slide.title || '', 650), 48, 70);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(16);
    let y = 135;
    for (const bullet of slide.bullets || []) {
      const lines = pdf.splitTextToSize(`• ${bullet}`, (slide.imageUrl || slide.image) ? 430 : 730);
      pdf.text(lines, 62, y); y += lines.length * 22 + 10;
    }
    if (slide.imageUrl || slide.image) {
      try {
        const image = await imageSourceToDataUrl(slide.imageUrl || slide.image);
        pdf.addImage(image, 'JPEG', 535, 125, 255, 255, undefined, 'FAST');
      } catch { /* keep text content downloadable */ }
    }
    pdf.setFontSize(9); pdf.setTextColor(text); pdf.text('CareerZ.pk', 48, 565); pdf.text(`${index + 1} / ${slides.length}`, 780, 565);
  }
  pdf.save(deckFileName(title, 'pdf'));
}

function SlideDeckViewer({ title, slides, allowDownloads = true }) {
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState('');
  const viewerRef = useRef(null);
  const slide = slides[current];
  if (!slide) return null;
  async function download(format) {
    setDownloading(format);
    try {
      if (format === 'pptx') await downloadDeckAsPptx(title, slides);
      else await downloadDeckAsPdf(title, slides);
    } finally { setDownloading(''); }
  }
  return (
    <div style={{ marginTop: 12 }}>
      <div ref={viewerRef} style={{ position: 'relative', overflow: 'hidden', background: slide.background, color: slide.text, borderRadius: 14, padding: '32px 38px', minHeight: 330, display: 'grid', gridTemplateColumns: (slide.imageUrl || slide.image) ? 'minmax(0, 1.15fr) minmax(220px, .85fr)' : '1fr', gap: 28, alignItems: 'center', borderTop: `9px solid ${slide.accent}` }}>
        <div><h3 style={{ fontSize: 27, marginBottom: 18, fontFamily: 'Fraunces, serif', color: slide.text }}>{slide.title}</h3><ul style={{ fontSize: 16, lineHeight: 1.55, paddingLeft: 22 }}>{(slide.bullets || []).map((b, i) => <li key={i} style={{ marginBottom: 8 }}>{b}</li>)}</ul></div>
        {(slide.imageUrl || slide.image) && <img src={slide.imageUrl || slide.image} alt={`Illustration for ${slide.title}`} style={{ width: '100%', maxHeight: 250, objectFit: 'contain', borderRadius: 14 }} />}
        <span style={{ position: 'absolute', right: 20, bottom: 12, fontSize: 11, opacity: .65 }}>{current + 1} / {slides.length}</span>
      </div>
      <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
        <button type="button" className="btn" onClick={() => setCurrent((n) => Math.max(0, n - 1))} disabled={current === 0}>Previous</button>
        <button type="button" className="btn" onClick={() => setCurrent((n) => Math.min(slides.length - 1, n + 1))} disabled={current === slides.length - 1}>Next</button>
        <button type="button" className="btn btn-primary" onClick={() => viewerRef.current?.requestFullscreen?.()}>Present Fullscreen</button>
        {allowDownloads && <button type="button" className="btn" onClick={() => download('pptx')} disabled={Boolean(downloading)}>{downloading === 'pptx' ? 'Preparing…' : 'Download PPTX'}</button>}
        {allowDownloads && <button type="button" className="btn" onClick={() => download('pdf')} disabled={Boolean(downloading)}>{downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}</button>}
      </div>
    </div>
  );
}








function CareerToolsPanel({ onFlash, onNavigate }) {
  const [missingSkills, setMissingSkills] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  useEffect(() => { apiRequest('/jobs/mine/dashboard').then((d) => setMissingSkills(d.profile.missingSkills || [])).catch(() => setMissingSkills([])); }, []);
  function refreshAi() { apiRequest('/ai/config').then((s) => setAiEnabled(s.text.configured)).catch(() => {}); }
  useEffect(refreshAi, []);

  return (
    <div className="career-toolkit-workspace">
      <h3 className="font-semibold mb-3">Career Tools</h3>
      <AiSettingsPanel onFlash={onFlash} onChanged={refreshAi} purposes={[AI_PURPOSES[0]]} />
      <div className="grid grid-cols-1 md:grid-cols-2 career-toolkit-grid" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <strong className="text-sm">Portfolio Builder</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Add project links with a title and description — shown on your CV.</p>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('portfolio')}>Open Portfolio</button>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <strong className="text-sm">Skill Recommendations</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Real signal from what's most requested in currently open job postings — not AI-generated.</p>
          {missingSkills === null && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Loading...</p>}
          {missingSkills?.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Nothing missing — your CV covers the market's top requested skills.</p>}
          {missingSkills?.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
              {missingSkills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--institution-tint)', color: 'var(--forest)', border: '1px solid var(--sand-line)' }}>{s}</span>)}
            </div>
          )}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('resume')}>Add Skills to CV</button>
        </div>
        <AiFeatureCard feature="cv_feedback" title="AI CV Feedback" description="Paste your CV text and get specific improvement feedback." placeholder="Paste your CV text here..." aiEnabled={aiEnabled} />
        <AiFeatureCard feature="cover_letter" title="Cover Letter Generator" description="Describe the job and your background — get a draft cover letter." placeholder="Job title, company, and a bit about your background..." aiEnabled={aiEnabled} />
        <AiFeatureCard feature="linkedin_optimize" title="LinkedIn Optimizer" description="Paste your current headline/summary — get a stronger rewrite." placeholder="Paste your LinkedIn headline or summary..." aiEnabled={aiEnabled} />
        <AiFeatureCard feature="interview_coach" title="AI Interview Coach" description="Get likely interview questions and tips for a specific role." placeholder="What role are you interviewing for?" aiEnabled={aiEnabled} />
        <MockInterviewCard onFlash={onFlash} aiEnabled={aiEnabled} />
        <AiFeatureCard feature="career_advice" title="Career Coach" description="Describe your interests/situation for practical career guidance." placeholder="Tell it about your interests, skills, and goals..." aiEnabled={aiEnabled} />
      </div>
    </div>
  );
}

function ResumeEditorPanel({ onFlash, user, onTemplates }) {
  const [resume, setResume] = useState(null);
  const [guided, setGuided] = useState(false);

  function load() {
    apiRequest('/resumes/me').then(setResume).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function save(e) {
    e.preventDefault();
    try {
      await apiRequest('/resumes/me', { method: 'PATCH', body: resume });
      onFlash('Resume saved.', 'success'); return true;
    } catch (err) { onFlash(err.message); }
  }

  function updateRow(field, index, key, value) {
    const rows = [...(resume[field] || [])];
    rows[index] = { ...rows[index], [key]: value };
    setResume({ ...resume, [field]: rows });
  }
  function addRow(field, blank) { setResume({ ...resume, [field]: [...(resume[field] || []), blank] }); }
  function removeRow(field, index) { setResume({ ...resume, [field]: resume[field].filter((_, i) => i !== index) }); }

  if (!resume) return <p role="status" className="admin-notice">Loading...</p>;

  const sectionLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  const publicUrl = `${window.location.origin}/portfolio/${resume.user}`;

  if (guided) return <GuidedResumeBuilder resume={resume} setResume={setResume} user={user} onFlash={onFlash} onExit={() => setGuided(false)} onTemplates={onTemplates} />;

  return (
    <>
    <div style={{ marginBottom: 18 }}><button type="button" className="btn btn-primary" onClick={() => setGuided(true)}>Build step by step</button></div>
    <SavedForm value={resume} onRestore={setResume} onSubmit={save} style={{ display: 'grid', gap: 18 }}>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>Fill empty sections from your verified CareerZ records (school, certificates, internships, achievements). Nothing you wrote is replaced.</p>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><CvAutofillButton onFilled={setResume} onFlash={onFlash} /><AiCvDraftButton onFlash={onFlash} onDraft={(d) => setResume((r) => mergeDraft(r, d))} /></span>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div>
            <p style={sectionLabel}>Career Portfolio Visibility</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>{resume.isPublic ? 'Anyone with the link can view your public portfolio.' : 'Your portfolio is private — only you can see it.'}</p>
            {resume.isPublic && <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center" style={{ color: 'var(--emerald)', display: 'inline-flex', marginTop: 6, overflowWrap: 'anywhere', gap: 4 }}>{publicUrl} <FaArrowUpRightFromSquare aria-hidden="true" size={10} /></a>}
          </div>
          <label className="flex items-center" style={{ gap: 10, flexShrink: 0, cursor: 'pointer' }}>
            <span className="text-xs" style={{ fontWeight: 600 }}>{resume.isPublic ? 'Public' : 'Private'}</span>
            <input type="checkbox" checked={!!resume.isPublic} onChange={(e) => setResume({ ...resume, isPublic: e.target.checked })} />
          </label>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Uploaded CV file</p>
        <CvFileUpload resume={resume} onChange={(r) => setResume((cur) => ({ ...cur, cvFile: r.cvFile, cvFileName: r.cvFileName }))} onFlash={onFlash} />
        <input className="form-input" placeholder="Paste a direct link to your CV file (PDF, Google Drive, etc.)" value={resume.cvFileUrl || ''} onChange={(e) => setResume({ ...resume, cvFileUrl: e.target.value })} style={{ marginTop: 10 }} />
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
          Or paste a link to your CV (Google Drive, Dropbox, etc.).
          {resume.cvFileUrl && <> · <a href={resume.cvFileUrl} target="_blank" rel="noreferrer">View current file</a></>}
        </p>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={sectionLabel}>Basic Info</p>
        <input className="form-input" placeholder="Headline / Professional title (e.g. Frontend Developer)" value={resume.headline} onChange={(e) => setResume({ ...resume, headline: e.target.value })} />
        <textarea className="form-input" placeholder="Summary" rows={3} value={resume.summary} onChange={(e) => setResume({ ...resume, summary: e.target.value })} />
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <input className="form-input" placeholder="Current location (city, country)" value={resume.location || ''} onChange={(e) => setResume({ ...resume, location: e.target.value })} style={{ flex: '1 1 220px', minWidth: 0 }} />
          <select className="form-select" value={resume.experienceLevel || ''} onChange={(e) => setResume({ ...resume, experienceLevel: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }}>
            <option value="">Experience level</option>
            <option value="entry">Entry level</option>
            <option value="mid">Mid level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead / Manager</option>
          </select>
        </div>
        <input className="form-input" placeholder="LinkedIn profile URL" value={resume.linkedinUrl || ''} onChange={(e) => setResume({ ...resume, linkedinUrl: e.target.value })} />
        <input
          className="form-input"
          placeholder="Skills (comma separated)"
          value={(resume.skills || []).join(', ')}
          onChange={(e) => setResume({ ...resume, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
        <input
          className="form-input"
          placeholder="Languages (comma separated)"
          value={(resume.languages || []).join(', ')}
          onChange={(e) => setResume({ ...resume, languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Education</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(resume.education || []).map((ed, i) => (
            <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3 flex flex-wrap items-start" style={{ gap: 10 }}>
              <input className="form-input" placeholder="Institution" value={ed.institution || ''} onChange={(e) => updateRow('education', i, 'institution', e.target.value)} style={{ flex: '2 1 180px', minWidth: 0 }} />
              <input className="form-input" placeholder="Degree" value={ed.degree || ''} onChange={(e) => updateRow('education', i, 'degree', e.target.value)} style={{ flex: '2 1 160px', minWidth: 0 }} />
              <input className="form-input" placeholder="Year" value={ed.year || ''} onChange={(e) => updateRow('education', i, 'year', e.target.value)} style={{ flex: '1 1 90px', minWidth: 0 }} />
              <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => removeRow('education', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 14 }} onClick={() => addRow('education', { institution: '', degree: '', year: '' })}>+ Add Education</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Experience</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(resume.experience || []).map((ex, i) => (
            <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3">
              <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 10 }}>
                <input className="form-input" placeholder="Job title" value={ex.title || ''} onChange={(e) => updateRow('experience', i, 'title', e.target.value)} style={{ flex: '1 1 160px', minWidth: 0 }} />
                <input className="form-input" placeholder="Company" value={ex.company || ''} onChange={(e) => updateRow('experience', i, 'company', e.target.value)} style={{ flex: '1 1 160px', minWidth: 0 }} />
                <input className="form-input" placeholder="Duration (e.g. 2022–2024)" value={ex.duration || ''} onChange={(e) => updateRow('experience', i, 'duration', e.target.value)} style={{ flex: '1 1 140px', minWidth: 0 }} />
              </div>
              <textarea className="form-input" placeholder="Description" rows={2} value={ex.description || ''} onChange={(e) => updateRow('experience', i, 'description', e.target.value)} />
              <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', marginTop: 10 }} onClick={() => removeRow('experience', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 14 }} onClick={() => addRow('experience', { title: '', company: '', duration: '', description: '' })}>+ Add Experience</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Certifications</p>
        <input
          className="form-input"
          placeholder="Certifications (comma separated)"
          value={(resume.certifications || []).join(', ')}
          onChange={(e) => setResume({ ...resume, certifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          style={{ marginTop: 10 }}
        />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Portfolio</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(resume.portfolio || []).map((p, i) => (
            <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3 flex flex-wrap items-start" style={{ gap: 10 }}>
              <input className="form-input" placeholder="Project title" value={p.title || ''} onChange={(e) => updateRow('portfolio', i, 'title', e.target.value)} style={{ flex: '1 1 160px', minWidth: 0 }} />
              <input className="form-input" placeholder="Link" value={p.url || ''} onChange={(e) => updateRow('portfolio', i, 'url', e.target.value)} style={{ flex: '1 1 200px', minWidth: 0 }} />
              <input className="form-input" placeholder="Short description" value={p.description || ''} onChange={(e) => updateRow('portfolio', i, 'description', e.target.value)} style={{ flex: '2 1 220px', minWidth: 0 }} />
              <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => removeRow('portfolio', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 14 }} onClick={() => addRow('portfolio', { title: '', url: '', description: '' })}>+ Add Project</button>
      </div>

      <button type="submit" className="btn btn-primary" style={{ padding: '8px 22px', fontSize: '0.85rem', justifySelf: 'start' }}>Save Resume</button>
    </SavedForm>
    </>
  );
}

function ScholarshipsPanel({ onFlash, user }) {
  const isDonor = (user?.roles || []).includes('donor');
  const [sub, setSub] = useUrlTab('scholarshipsPanel', 'browse');
  const tabs = [
    { key: 'browse', label: 'Browse Scholarships' },
    { key: 'applications', label: 'My Applications' },
    ...(isDonor ? [{ key: 'manage', label: 'My Scholarships' }, { key: 'post', label: 'Post a Scholarship' }] : [])
  ];
  return (
    <div className="funding-workspace">
      <header className="support-page-heading"><span><FaGraduationCap aria-hidden="true" /></span><div><h2>Scholarships &amp; Funding</h2><p>Explore funding opportunities, review eligibility and track your applications.</p></div></header>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'browse' && <ScholarshipBrowsePanel onFlash={onFlash} />}
      {sub === 'applications' && <MyScholarshipApplicationsPanel onFlash={onFlash} />}
      {sub === 'manage' && <MyScholarshipsPanel onFlash={onFlash} />}
      {sub === 'post' && <PostScholarshipPanel onFlash={onFlash} />}
    </div>
  );
}

function ScholarshipBrowsePanel({ onFlash }) {
  const [scholarships, setScholarships] = useState(null);
  const [statements, setStatements] = useState({});

  function load() { apiRequest('/scholarships').then(setScholarships).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function apply(id) {
    try {
      await apiRequest(`/scholarships/${id}/apply`, { method: 'POST', body: { statement: statements[id] || '' } });
      onFlash('Application submitted.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  if (scholarships === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (scholarships.length === 0) return <p className="support-empty" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No open scholarships right now.</p>;

  return (
    <div className="grid grid-cols-1 gap-3 funding-list">
      {scholarships.map((s) => (
        <div key={s._id} className="funding-card border border-[var(--sand-line)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div><strong>{s.title}</strong><p className="text-xs text-[var(--ink-soft)]">{s.currency} {s.amount} · {s.country || 'Any country'} · by {s.donor?.fullName}</p></div>
            {s.applicationDeadline && <span className="text-xs">Deadline: {new Date(s.applicationDeadline).toLocaleDateString()}</span>}
          </div>
          {s.description && <p className="text-sm mt-2">{s.description}</p>}
          {s.eligibilityCriteria && <p className="text-xs mt-1 text-[var(--ink-soft)]">Eligibility: {s.eligibilityCriteria}</p>}
          <div className="flex gap-2 items-end mt-2 flex-wrap">
            {(s.requiredDocuments?.length > 0 || s.otherDocuments?.length > 0) && <span className="text-xs" style={{ color: 'var(--ink-soft)', flexBasis: '100%' }}>Documents needed: {[...(s.requiredDocuments || []).map((k) => k.replace(/_/g, ' ')), ...(s.otherDocuments || [])].join(', ')}</span>}
            <ScholarshipApplyButton scholarship={s} onFlash={onFlash} onDone={load} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MyScholarshipApplicationsPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  useEffect(() => { apiRequest('/scholarships/mine/applications').then(setApplications).catch((err) => onFlash(err.message)); }, [onFlash]);
  return (
    <Table
      loading={applications === null}
      headers={['Scholarship', 'Amount', 'Status', 'Applied']}
      rows={(applications || []).map((a) => [a.scholarship?.title, `${a.scholarship?.currency || ''} ${a.scholarship?.amount ?? ''}`, <Tag status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, new Date(a.createdAt).toLocaleDateString()])}
      empty="No scholarship applications yet."
    />
  );
}

// Posting and editing use the same form; `initial` = the scholarship being edited.
function PostScholarshipPanel({ onFlash, initial = null, onDone, onCancel }) {
  const [form, setForm] = useState(() => initial
    ? { title: initial.title || '', description: initial.description || '', amount: String(initial.amount ?? ''), currency: initial.currency || 'PKR', eligibilityCriteria: initial.eligibilityCriteria || '', country: initial.country || '', applicationDeadline: initial.applicationDeadline ? String(initial.applicationDeadline).slice(0, 10) : '', seatsAvailable: initial.seatsAvailable ?? 1, audience: initial.audience?.length ? initial.audience : ['students'], requiredDocuments: initial.requiredDocuments || [], otherDocuments: initial.otherDocuments || [] }
    : { title: '', description: '', amount: '', currency: 'PKR', eligibilityCriteria: '', country: '', applicationDeadline: '', seatsAvailable: 1, audience: ['students'], requiredDocuments: ['cnic', 'latest_result'], otherDocuments: [] });

  async function submit(e) {
    e.preventDefault();
    try {
      const body = { ...form, amount: Number(form.amount), seatsAvailable: Number(form.seatsAvailable), applicationDeadline: form.applicationDeadline || null };
      if (initial) await apiRequest(`/scholarships/${initial._id}`, { method: 'PATCH', body });
      else await apiRequest('/scholarships', { method: 'POST', body });
      onFlash(initial ? 'Scholarship updated.' : 'Scholarship posted. It is now in My Scholarships.', 'success');
      if (!initial) setForm({ title: '', description: '', amount: '', currency: 'PKR', eligibilityCriteria: '', country: '', applicationDeadline: '', seatsAvailable: 1, audience: ['students'], requiredDocuments: ['cnic', 'latest_result'], otherDocuments: [] });
      onDone?.();
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <form onSubmit={submit} className="card" style={{ padding: 20, display: 'grid', gap: 16, maxWidth: 620 }}>
      <input className="form-input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <label style={{ flex: '2 1 140px', minWidth: 0 }}>
          <span style={fieldLabel}>Amount</span>
          <input className="form-input" type="number" placeholder="e.g. 1000" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </label>
        <label style={{ flex: '1 1 100px', minWidth: 0 }}>
          <span style={fieldLabel}>Currency</span>
          <input className="form-input" placeholder="USD" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        </label>
        <label style={{ flex: '1 1 100px', minWidth: 0 }}>
          <span style={fieldLabel}>Seats</span>
          <input className="form-input" type="number" min="1" placeholder="1" value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })} />
        </label>
      </div>
      <input className="form-input" placeholder="Eligibility criteria" value={form.eligibilityCriteria} onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })} />
      <ScholarshipDocumentsPicker value={form.requiredDocuments || []} other={form.otherDocuments || []} onChange={(d) => setForm((f) => ({ ...f, ...d }))} />
      <fieldset className="text-sm" style={{ border: 0, padding: 0, display: 'flex', gap: 14, flexWrap: 'wrap' }}><legend className="text-xs" style={{ fontWeight: 600 }}>Who can apply (they get an alert when you post)</legend>
        {[['students', 'Students'], ['teachers', 'Teachers']].map(([v, l]) => <label key={v} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={form.audience.includes(v)} onChange={() => setForm({ ...form, audience: form.audience.includes(v) ? (form.audience.length > 1 ? form.audience.filter((x) => x !== v) : form.audience) : [...form.audience, v] })} />{l}</label>)}
      </fieldset>
      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <input className="form-input" placeholder="Country (optional)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
        <label style={{ flex: '1 1 200px', minWidth: 0 }}>
          <span style={fieldLabel}>Application Deadline</span>
          <input className="form-input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '8px 20px' }}>Post Scholarship</button>
    </form>
  );
}

function MyScholarshipsPanel({ onFlash, onNavigate }) {
  const [scholarships, setScholarships] = useState(null);
  const [applicants, setApplicants] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(null);
  async function setOpen(s, status) {
    try { await apiRequest(`/scholarships/${s._id}`, { method: 'PATCH', body: { status } }); onFlash(status === 'closed' ? 'Scholarship closed to new applications.' : 'Scholarship open again.', 'success'); loadMine(); } catch (err) { onFlash(err.message); }
  }

  const loadMine = () => apiRequest('/scholarships/mine/list').then(setScholarships).catch((err) => onFlash(err.message));
  useEffect(() => { loadMine(); }, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  function viewApplicants(id) {
    setOpenId(id);
    setApplicants(null);
    apiRequest(`/scholarships/${id}/applicants`).then(setApplicants).catch((err) => onFlash(err.message));
  }

  async function decide(appId, status) {
    try {
      await apiRequest(`/scholarships/applications/${appId}/status`, { method: 'PATCH', body: { status } });
      viewApplicants(openId);
      onFlash(`Application ${status}.`, 'success');
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <DonorListingRequests scholarships={scholarships} onFlash={onFlash} onChanged={loadMine} />
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 10, marginBottom: 10 }}>
        <h3 className="font-semibold" style={{ margin: 0 }}>My Scholarships</h3>
        {onNavigate && <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => onNavigate('post')}>+ Post a scholarship</button>}
      </div>
      {editing && <div style={{ marginBottom: 16 }}><h4 className="font-semibold mb-2">Edit: {editing.title}</h4><PostScholarshipPanel key={editing._id} initial={editing} onFlash={onFlash} onDone={() => { setEditing(null); loadMine(); }} /><button type="button" className="btn mt-2" onClick={() => setEditing(null)}>Cancel editing</button></div>}
      <Table
        loading={scholarships === null}
        headers={['Title', 'Amount', 'Seats', 'Deadline', 'Posted', 'Status', 'Action']}
        rows={(scholarships || []).map((s) => [s.title, `${s.currency} ${Number(s.amount).toLocaleString()}`, s.seatsAvailable ?? '—', s.applicationDeadline ? new Date(s.applicationDeadline).toLocaleDateString() : '—', s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—', <><Tag status={s.status === 'open' ? 'approved' : s.status === 'removed_by_admin' ? 'rejected' : 'pending'} label={s.status === 'removed_by_admin' ? 'Removed by CareerZ admin' : s.status} /><AdminRemovedNote item={s} /></>, <div className="flex gap-1 flex-wrap"><button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => viewApplicants(s._id)}>View Applicants</button><button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => { setEditing(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>{s.status === 'open' && <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setOpen(s, 'closed')}>Close</button>}{s.status === 'closed' && !s.publishedBy && <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setOpen(s, 'open')}>Reopen</button>}</div>])}
        empty="You haven't posted any scholarships yet."
      />
      {openId && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Applicants</h4>
          {applicants?.length > 1 && <RankScholarshipApplicants scholarshipId={openId} onFlash={onFlash} />}
          <Table
            loading={applicants === null}
            headers={['Applicant', 'Application', 'Status', 'Decision']}
            rows={(applicants || []).map((a) => [
              a.applicant?.fullName, <ApplicationDetails application={a} onFlash={onFlash} />, <Tag status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />,
              a.status === 'pending' ? (
                <div className="flex gap-1">
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => decide(a._id, 'approved')}>Approve</button>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => decide(a._id, 'rejected')}>Reject</button>
                </div>
              ) : '—'
            ])}
            empty="No applicants yet."
          />
        </div>
      )}
    </div>
  );
}





// The real listing lifecycle — draft (not submitted) / pending_approval (Super Admin review) /
// active (live) / rejected (admin declined) / out_of_stock (auto-set when stock hits 0) / paused
// (seller took it down themselves).
const PRODUCT_STATUS = {
  draft: { tag: 'under_review', label: 'Draft' },
  pending_approval: { tag: 'pending', label: 'Held for a CareerZ check' },
  active: { tag: 'approved', label: 'Active' },
  rejected: { tag: 'rejected', label: 'Rejected' },
  out_of_stock: { tag: 'pending', label: 'Out of Stock' },
  paused: { tag: 'under_review', label: 'Paused' },
  removed: { tag: 'rejected', label: 'Removed' },
  removed_by_admin: { tag: 'rejected', label: 'Removed by CareerZ admin' }
};
const PRODUCT_CATEGORIES = ['books', 'stationery', 'uniform', 'electronics', 'notes', 'courses', 'services', 'other'];
const EMPTY_PRODUCT_FORM = { title: '', description: '', category: 'other', price: '', currency: 'PKR', stock: 0, images: '' };

function ProductDetailModal({ product, onClose }) {
  if (!product) return null;
  const st = PRODUCT_STATUS[product.status] || PRODUCT_STATUS.draft;
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <div>
            <h3>{product.title}</h3>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{product.category}</p>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}><FaXmark aria-hidden="true" /></button>
        </div>
        <div className="u-modal-body">
          {product.images?.[0] && <img src={product.images[0]} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Description:</strong> {product.description || 'Not provided'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Price:</strong> {product.currency} {product.price}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Available quantity:</strong> {product.stock}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Total sales:</strong> {product.totalSales ?? 0} unit{product.totalSales === 1 ? '' : 's'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Views:</strong> {product.views ?? 0}</p>
          {product.status === 'rejected' && product.reviewNotes && <p className="text-xs" style={{ marginBottom: 8, color: 'var(--ink-soft)' }}><strong>Rejection reason:</strong> {product.reviewNotes}</p>}
          <p className="text-xs"><strong>Status:</strong> <Tag status={st.tag} label={st.label} /></p>
        </div>
      </div>
    </div>
  );
}

function MyListingsPanel({ onFlash }) {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [viewing, setViewing] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_PRODUCT_FORM);

  function load() { apiRequest('/marketplace/products/mine/list').then(setProducts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function create(e, status) {
    e.preventDefault();
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images ? [form.images] : [] };
      if (status === 'draft') body.status = 'draft';
      const made = await apiRequest('/marketplace/products', { method: 'POST', body });
      onFlash(((p) => (p.status === 'draft' ? 'Draft saved.' : p.status === 'pending_approval' ? 'Saved. Our automatic check wants a CareerZ admin to look at it first; you will be told.' : 'Your listing is live on the marketplace.'))(made), 'success');
      setForm(EMPTY_PRODUCT_FORM);
      load();
    } catch (err) { onFlash(err.message); }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditForm({ title: p.title, description: p.description || '', category: p.category, price: p.price, currency: p.currency, stock: p.stock, images: p.images?.[0] || '' });
  }
  async function saveEdit(id) {
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'PATCH', body: { ...editForm, price: Number(editForm.price), stock: Number(editForm.stock), images: editForm.images ? [editForm.images] : [] } });
      onFlash('Listing updated.', 'success');
      setEditingId(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function togglePause(p) {
    try {
      await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: p.status === 'active' ? 'paused' : 'active' } });
      onFlash(p.status === 'active' ? 'Listing paused.' : 'Listing reactivated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function submitForReview(p) {
    try {
      const done = await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: 'pending_approval' } });
      onFlash(done?.status === 'active' || done?.status === 'out_of_stock' ? 'Published. Your listing is live.' : 'Our automatic check wants a CareerZ admin to look at it first.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(id) {
    if (!(await showConfirm('Remove this listing from the marketplace? Past orders keep their history. A listing with an order in progress cannot be removed.', { title: 'Delete listing', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'DELETE' });
      onFlash('Listing removed.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 18 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Add Listing</h3>
      </div>
      <form style={{ display: 'grid', gap: 20, maxWidth: 560, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Listing Details</p>
          <input className="form-input" placeholder="Product/service name" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="form-input" placeholder="Image URL (paste a direct image link)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        </div>

        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Category & Pricing</p>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Category" minWidth="100%" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
            </div>
            <input className="form-input" type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
            <input className="form-input" type="number" placeholder="Available quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn" onClick={(e) => create(e, 'draft')}>Save as Draft</button>
          <button type="button" className="btn btn-primary" onClick={(e) => create(e, 'submit')}>Add Listing</button>
        </div>
      </form>

      <h3 className="font-semibold mb-2">Products/Listings Overview</h3>
      <Table
        loading={products === null}
        headers={['Image', 'Name', 'Category', 'Price', 'Available Qty', 'Status', 'Total Sales', 'Views', 'Actions']}
        rows={(products || []).map((p) => {
          const st = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft;
          const isEditing = editingId === p._id;
          return [
            p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--sand-line)' }} />,
            isEditing ? <input className="form-input" style={{ padding: '4px 6px', fontSize: '0.75rem' }} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /> : p.title,
            isEditing ? (
              <div style={{ minWidth: 130 }}>
                <CustomSelect value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} ariaLabel="Category" minWidth="100%" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
              </div>
            ) : p.category,
            isEditing ? <input className="form-input" type="number" style={{ padding: '4px 6px', fontSize: '0.75rem', width: 80 }} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} /> : `${p.currency} ${p.price}`,
            isEditing ? <input className="form-input" type="number" style={{ padding: '4px 6px', fontSize: '0.75rem', width: 70 }} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} /> : p.stock,
            <><Tag status={st.tag} label={st.label} /><AdminRemovedNote item={p} /></>,
            `${p.totalSales ?? 0} sold`,
            p.views ?? 0,
            <div className="flex gap-2 flex-wrap">
              {isEditing ? (
                <>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => saveEdit(p._id)}>Save</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setViewing(p)}>View</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => startEdit(p)}>Edit</button>
                  {p.status === 'draft' && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => submitForReview(p)}>Publish</button>}
                  {(p.status === 'active' || p.status === 'paused') && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => togglePause(p)}>{p.status === 'active' ? 'Pause' : 'Reactivate'}</button>}
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => remove(p._id)}>Delete</button>
                </>
              )}
            </div>
          ];
        })}
        empty="You haven't listed anything yet."
      />
      <ProductDetailModal product={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

function SellerOrdersPanel({ onFlash }) {
  return <SellerOrdersBoard onFlash={onFlash} />;
}

const SELLER_WITHDRAWAL_STATUS = {
  requested: { tag: 'pending', label: 'Requested' },
  processing: { tag: 'pending', label: 'Processing' },
  paid: { tag: 'approved', label: 'Paid' },
  rejected: { tag: 'rejected', label: 'Rejected' }
};

// Seller item 10 — Wallet. Reuses the exact same computeEarnings numbers as item 9's Earnings &
// Commission (never a second, conflicting "available balance"). "Selected Currency" is a real UI
// control when the seller operates in more than one currency — most sellers only ever see one tab.
function SellerWalletPanel({ onFlash }) {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);
  const [donorDeposits, setDonorDeposits] = useState(null);
  const [orders, setOrders] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  function load() {
    apiRequest('/marketplace/sellers/mine/wallet').then((data) => {
      setWallet(data);
      setSelectedCurrency((prev) => prev && data[prev] ? prev : Object.keys(data)[0] || null);
    }).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/withdrawals').then(setWithdrawals).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/orders/selling').then(setOrders).catch(() => setOrders([]));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw({ payoutMethod, payoutDetails, accountTitle }) {
    try {
      const result = await apiRequest('/marketplace/sellers/mine/withdraw', { method: 'POST', body: { currency: selectedCurrency, payoutMethod, payoutDetails, accountTitle } });
      onFlash(`Withdrawal requested — receipt ${result.transactionId}.`, 'success');
      load();
      return result;
    } catch (err) { onFlash(err.message); }
  }

  if (wallet === null || withdrawals === null || orders === null) return <p role="status" className="admin-notice">Loading...</p>;

  const currencies = Object.keys(wallet);
  const w = selectedCurrency ? wallet[selectedCurrency] : null;

  // Transaction history — every realized sale + every withdrawal, for the selected currency.
  const transactions = [
    ...orders.filter((o) => o.currency === selectedCurrency && ['delivered', 'completed'].includes(o.status)).map((o) => ({ type: 'Sale', date: o.createdAt, amount: o.totalPrice, ref: o._id.slice(-8).toUpperCase() })),
    ...withdrawals.filter((wd) => wd.currency === selectedCurrency).map((wd) => ({ type: 'Withdrawal', date: wd.createdAt, amount: -wd.amount, ref: wd._id.slice(-8).toUpperCase(), status: wd.status }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaWallet aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Wallet</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 24, lineHeight: 1.6 }}>No real payment processor is wired up — "Withdraw Funds" creates a real, trackable request; nothing here moves actual money.</p>

      {currencies.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 24 }}>
          <FaWallet aria-hidden="true" />
          <p>No wallet activity yet</p>
        </div>
      ) : (
        <>
          {currencies.length > 1 && (
            <div style={{ maxWidth: 200, marginBottom: 16 }}>
              <CustomSelect value={selectedCurrency || ''} onChange={setSelectedCurrency} ariaLabel="Selected currency" minWidth="100%" options={currencies.map((c) => ({ value: c, label: c }))} />
            </div>
          )}
          {w && (
            <div className="card" style={{ padding: 20, marginBottom: 28 }}>
              <strong className="text-sm">{selectedCurrency} Wallet</strong>
              <div className="grid grid-cols-3 gap-3" style={{ marginTop: 14, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={fieldLabel}>Available Balance</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--emerald)' }}>{selectedCurrency} {w.availableBalance}</strong>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={fieldLabel}>Pending Balance</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--gold)' }}>{selectedCurrency} {w.pendingBalance}</strong>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={fieldLabel}>Total Earnings</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{selectedCurrency} {w.totalEarnings}</strong>
                </div>
              </div>
              <PayoutRequestForm onSubmit={withdraw} disabled={w.availableBalance <= 0} label={`Withdraw Funds (${selectedCurrency} ${w.availableBalance})`} />
            </div>
          )}
        </>
      )}

      <p style={{ ...fieldLabel, marginBottom: 12 }}>Transaction History</p>
      <Table
        headers={['Type', 'Date', 'Amount', 'Reference']}
        rows={transactions.map((t) => [
          t.type,
          new Date(t.date).toLocaleDateString(),
          <strong style={{ color: t.amount >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}>{t.amount >= 0 ? '' : '-'}{selectedCurrency} {Math.abs(t.amount)}</strong>,
          t.ref
        ])}
        empty="No transactions yet."
      />

      <p style={{ ...fieldLabel, marginTop: 28, marginBottom: 12 }}>Withdrawal History</p>
      <Table
        headers={['Amount', 'Currency', 'Status', 'Requested', 'Processed']}
        rows={withdrawals.map((wd) => [
          wd.amount, wd.currency,
          <Tag status={SELLER_WITHDRAWAL_STATUS[wd.status]?.tag} label={SELLER_WITHDRAWAL_STATUS[wd.status]?.label} />,
          new Date(wd.createdAt).toLocaleDateString(),
          wd.processedAt ? new Date(wd.processedAt).toLocaleDateString() : '—'
        ])}
        empty="No withdrawals requested yet."
      />
    </div>
  );
}




// Seller sidebar — Add New Listing, a focused standalone form (Products/Listings keeps its own
// copy of this form too, for convenience — both post to the same endpoint).
function AddListingPanel({ onFlash }) {
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);

  async function create(status) {
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images ? [form.images] : [] };
      if (status === 'draft') body.status = 'draft';
      const made = await apiRequest('/marketplace/products', { method: 'POST', body });
      onFlash(((p) => (p.status === 'draft' ? 'Draft saved.' : p.status === 'pending_approval' ? 'Saved. Our automatic check wants a CareerZ admin to look at it first; you will be told.' : 'Your listing is live on the marketplace.'))(made), 'success');
      setForm(EMPTY_PRODUCT_FORM);
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 18 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={16} /></span>
        <div>
          <h3 className="font-semibold" style={{ margin: 0 }}>Add New Listing</h3>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>Products and services are both listed the same way — pick a digital category (Courses/Services) to skip stock tracking.</p>
        </div>
      </div>
      <form style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Listing Details</p>
          <input className="form-input" placeholder="Product/service name" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="form-input" placeholder="Image URL (paste a direct image link)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        </div>

        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Category & Pricing</p>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Category" minWidth="100%" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
            </div>
            <input className="form-input" type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
            {!['courses', 'services', 'notes'].includes(form.category) && <input className="form-input" type="number" placeholder="Available quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} />}
          </div>
        </div>

        {['notes', 'courses', 'services'].includes(form.category) && <DigitalListingFields form={form} setForm={setForm} />}
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => create('draft')}>Save as Draft</button>
          <button type="button" className="btn btn-primary" onClick={() => create('submit')}>Submit Listing</button>
        </div>
      </form>
    </div>
  );
}







function classStatusNow(entry) {
  const now = new Date();
  const dow = DOW_INDEX[entry.dayOfWeek];
  if (dow === undefined) return 'upcoming';
  if (dow !== now.getDay()) return 'upcoming';
  const [sh, sm] = (entry.startTime || '0:0').split(':').map(Number);
  const [eh, em] = (entry.endTime || '0:0').split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em) return 'live';
  return nowMin < sh * 60 + sm ? 'today' : 'past';
}

// classStatusNow returns 4 real states, but the table only ever showed "Live" vs a blanket
// "pending" — which read as "awaiting approval" when it actually just meant "not right now",
// even for a class that already finished hours ago. These give each state its own honest label.
const CLASS_STATUS_TAG = { live: 'approved', today: 'pending', upcoming: 'pending', past: 'completed' };
const CLASS_STATUS_LABEL = { live: 'Live Now', today: 'Upcoming', upcoming: 'Upcoming', past: 'Completed' };



// PDF Section 4 — "My Classes: Central Learning Entry": Current / Upcoming / In-Progress,
// with a clear Live indicator and a Join Class action (structure is real; the actual video
// classroom is a paid/third-party integration the client hasn't provided credentials for yet,
// so Join Class explains that instead of silently doing nothing).
function TimetableView({ onFlash, url }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => { apiRequest(url).then(setEntries).catch((err) => onFlash(err.message)); }, [url, onFlash]);

  function joinClass(entry) {
    if (entry.feeAccess?.blocked) {
      onFlash(`${entry.feeAccess.title} is ${entry.feeAccess.status}. Pay it from Fees & Wallet to unlock class access.`, 'error');
      return;
    }
    if (entry.meetingLink) { window.open(entry.meetingLink, '_blank', 'noreferrer'); return; }
    onFlash('No video provider is connected yet for live classes — once one is configured, Join Class will open it directly here.', 'error');
  }

  const sorted = (entries || [])
    .map((t) => ({ ...t, __status: classStatusNow(t), __nextDate: nextDateForDow(t.dayOfWeek, t.startTime) }))
    .sort((a, b) => (a.__status === 'live' ? -1 : 1) - (b.__status === 'live' ? -1 : 1) || (a.__nextDate || 0) - (b.__nextDate || 0));

  const live = sorted.filter((t) => t.__status === 'live');
  const blockedFee = sorted.find((t) => t.feeAccess?.blocked)?.feeAccess;

  return (
    <div>
      <h3 className="font-semibold mb-2">My Classes</h3>
      {blockedFee && <div className="admin-notice error flex items-center" role="alert" style={{ gap: 6 }}><FaLock aria-hidden="true" /> Class access locked: {blockedFee.title} ({blockedFee.currency} {blockedFee.amount}) is {blockedFee.status}. Open Fees &amp; Wallet, complete payment, and wait for institution confirmation if you used a manual method.</div>}

      {live.length > 0 && (
        <div className="mb-4">
          {live.map((t) => (
            <div key={t._id} className="border rounded-xl p-3 mb-2 flex items-center justify-between" style={{ borderColor: 'var(--rose)' }}>
              <div>
                <span style={{ color: 'var(--rose)', fontWeight: 700 }}><FaCircle aria-hidden="true" style={{ color: 'var(--rose)', fontSize: 8, verticalAlign: 'middle' }} /> Class in Progress</span>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{t.subject} · {formatTime12h(t.startTime)}–{formatTime12h(t.endTime)} · {t.teacher?.fullName || ''}</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => joinClass(t)}>Join Class</button>
            </div>
          ))}
        </div>
      )}

      <Table
        loading={entries === null}
        headers={['When', 'Course / Class', 'Teacher', 'Room', 'Status', 'Action']}
        rows={sorted.map((t) => [
          <span className="exam-cell"><strong style={{ whiteSpace: 'nowrap' }}>{DOW_LABEL[t.dayOfWeek]}{t.__nextDate ? `, ${t.__nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</strong><small style={{ whiteSpace: 'nowrap' }}>{formatTime12h(t.startTime)}–{formatTime12h(t.endTime)}</small></span>,
          <span className="exam-cell"><strong>{t.course?.title || t.subject}</strong><small>{t.classSection?.name || 'No class set'}</small></span>, t.teacher?.fullName || t.teacher?.email || '—', t.room || '—',
          <Tag status={CLASS_STATUS_TAG[t.__status] || 'pending'} label={CLASS_STATUS_LABEL[t.__status] || 'Upcoming'} />,
          t.feeAccess?.blocked ? <button className="btn flex items-center" style={{ padding: '4px 12px', fontSize: '0.78rem', gap: 5 }} onClick={() => joinClass(t)}><FaLock aria-hidden="true" /> Fee due</button>
            : t.__status === 'live' ? <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => joinClass(t)}>Join</button> : '—'
        ])}
        empty="No timetable set up yet."
      />
    </div>
  );
}

const PAYMENT_METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_wallet', label: 'Mobile Wallet' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];
const MANUAL_FEE_METHODS = PAYMENT_METHODS.filter((method) => method.value !== 'card');

// Online fee payment goes through JazzCash's hosted page (wallet / card / voucher); manual
// payments stay pending until verified. Works for a student's own fee and a parent paying a
// linked child's fee; checkoutPath lets other payables (independent tutoring fees) reuse it.
// Safepay's hosted page: card (local or international), JazzCash, Easypaisa or bank/Raast.
function SafepayCheckoutButton({ onFlash, checkoutPath, body, label = 'Pay with Safepay' }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { getSafepayConfig().then(setConfig); }, []);
  async function startCheckout() {
    setLoading(true);
    try { await startSafepayCheckout(checkoutPath, body); } catch (err) { onFlash(err.message); setLoading(false); }
  }
  if (!config?.enabled) return null;
  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={loading}
      style={{
        padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg, #0b6e4f, #13a36e)', color: '#fff', cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%'
      }}
    >
      <FaMobileScreen aria-hidden="true" /> {loading ? 'Redirecting...' : label} {!loading && <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.78rem' }}>(Card / JazzCash / Easypaisa / Bank)</span>}
    </button>
  );
}

function JazzCashCheckoutButton({ feeId, onFlash, checkoutPath }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { getJazzCashConfig().then(setConfig); }, []);

  async function startCheckout() {
    setLoading(true);
    try { await startJazzCashCheckout(checkoutPath || `/payments/jazzcash/fees/${feeId}/checkout`); } catch (err) { onFlash(err.message); setLoading(false); }
  }

  if (!config?.enabled) return null;
  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={loading}
      style={{
        padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg, #c8102e, #e43d4f)', color: '#fff', cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%'
      }}
    >
      <FaMobileScreen aria-hidden="true" /> {loading ? 'Redirecting...' : 'Pay with JazzCash'} {!loading && <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.78rem' }}>(Wallet / Card / Voucher)</span>}
    </button>
  );
}

function PayFeeButton({ fee, onFlash, onPaid }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('bank_transfer');
  const [amount, setAmount] = useState(String(fee.outstandingAmount ?? fee.amount ?? ''));
  const [reference, setReference] = useState('');
  const [bankName, setBankName] = useState('');
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState(null);
  const [paying, setPaying] = useState(false);

  async function confirmPay(e) {
    e.preventDefault();
    if (!reference.trim()) return onFlash('Enter the payment reference or receipt number.');
    if (method !== 'cash' && !proof) return onFlash('Upload payment proof for this payment method.');
    setPaying(true);
    try {
      let proofUrl = '';
      if (proof) proofUrl = await uploadToPlatformStorage(proof, 'fee-payment-proofs');
      const updated = await apiRequest(`/institution-fees/fees/${fee._id}/report-payment`, {
        method: 'POST',
        body: { amount: Number(amount), method, reference: reference.trim(), bankName: bankName.trim(), paidOn, notes: notes.trim(), proofUrl }
      });
      onFlash('Payment reported. Awaiting institution confirmation.', 'success');
      setOpen(false);
      setReference(''); setBankName(''); setNotes(''); setProof(null);
      onPaid?.(updated);
    } catch (err) { onFlash(err.message); } finally { setPaying(false); }
  }

  // Who paid (student or which parent), so both sides can see it and nobody pays twice.
  const payer = (info) => (info ? `${info.name} (${info.role})` : '');
  if (fee.status === 'paid') {
    return <div className="text-xs fee-paid-by" title={fee.paidVia}>
      <strong style={{ color: 'var(--emerald)' }}>✓ Paid{fee.paidByInfo ? ` by ${payer(fee.paidByInfo)}` : ''}</strong>
      {fee.paidAt && <div style={{ color: 'var(--ink-soft)' }}>{new Date(fee.paidAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>}
      {(fee.receiptNumber || fee.transactionId) && <div style={{ color: 'var(--ink-soft)' }}>Receipt {fee.receiptNumber || fee.transactionId}</div>}
    </div>;
  }

  if (fee.status === 'processing') {
    const pending = [...(fee.paymentHistory || [])].reverse().find((h) => h.verificationStatus === 'pending');
    return <span className="text-xs" style={{ color: 'var(--gold)' }}>{pending?.paidByInfo ? `Reported by ${payer(pending.paidByInfo)} — awaiting institution confirmation` : 'Awaiting institution confirmation...'}</span>;
  }

  // Independent tutoring fee: paid online by the student or a linked parent.
  if (fee.kind === 'tutoring') {
    return <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
      <ManualPayButton kind="tutoring" id={fee.tutoringLinkId} onFlash={onFlash} onDone={onPaid} />
      <SafepayCheckoutButton onFlash={onFlash} checkoutPath={`/teacher-students/${fee.tutoringLinkId}/fee-checkout`} />
      <JazzCashCheckoutButton feeId={fee._id} onFlash={onFlash} checkoutPath={`/teacher-students/${fee.tutoringLinkId}/fee-checkout`} />
      <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Tuition for {fee.teacherName || 'your tutor'}. The student or a parent can pay.</span>
    </div>;
  }

  if (!open) {
    return (
      <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
        <ManualPayButton kind="fee" id={fee._id} onFlash={onFlash} onDone={onPaid} />
        <SafepayCheckoutButton onFlash={onFlash} checkoutPath={`/payments/jazzcash/fees/${fee._id}/checkout`} />
        <JazzCashCheckoutButton feeId={fee._id} onFlash={onFlash} />
      </div>
    );
  }

  return (
    <form onSubmit={confirmPay} style={{ display: 'grid', gap: 7, minWidth: 280, maxWidth: 360 }}>
      <CustomSelect value={method} onChange={setMethod} ariaLabel="Payment method" minWidth="100%" options={MANUAL_FEE_METHODS} />
      <input className="form-input" type="number" min="0.01" step="0.01" max={fee.outstandingAmount ?? fee.amount} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount paid" required />
      <input className="form-input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={method === 'cash' ? 'Cash receipt/reference number' : 'Transaction/reference number'} required />
      {(method === 'bank_transfer' || method === 'mobile_wallet') && <input className="form-input" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={method === 'mobile_wallet' ? 'Wallet/provider name' : 'Bank name'} required />}
      <label className="text-xs">Payment date<input className="form-input" type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} required /></label>
      <textarea className="form-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" />
      <label className="text-xs">Payment proof {method === 'cash' ? '(optional)' : '(required)'}<input className="form-input" type="file" accept="image/*,.pdf" onChange={(e) => setProof(e.target.files?.[0] || null)} required={method !== 'cash'} /></label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '0.75rem' }} disabled={paying}>{paying ? 'Submitting...' : 'Submit for verification'}</button>
        <button type="button" className="btn" style={{ padding: '7px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(false)} disabled={paying}>Cancel</button>
      </div>
    </form>
  );
}


const PAYOUT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_wallet', label: 'Mobile Wallet' },
  { value: 'other', label: 'Other' }
];

// Shared "Withdraw Funds" flow for anyone cashing out a balance (Education Agent commissions,
// Marketplace Seller earnings) — the payee picks how they want to receive it and provides an
// account reference, same honesty pattern as PayFeeButton (no real payment processor here).
function PayoutRequestForm({ onSubmit, disabled, label }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('bank_transfer');
  const [accountTitle, setAccountTitle] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!details.trim() || !accountTitle.trim()) return;
    setSubmitting(true);
    try {
      // No real bank-verification API is connected, so there's no way to auto-confirm whose
      // account a number belongs to — the account holder's name is instead explicitly entered
      // here and shown back to Admin on the review screen before they approve anything.
      const result = await onSubmit({ payoutMethod: method, payoutDetails: details.trim(), accountTitle: accountTitle.trim() });
      // A findable receipt exists the moment the request is made — not only after it's approved —
      // so the requester has proof even if it's rejected or never actioned.
      if (result?.transactionId || result?.reference) setReceipt(result.transactionId || result.reference);
      setOpen(false);
      setDetails(''); setAccountTitle('');
    } finally { setSubmitting(false); }
  }

  if (!open) {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} disabled={disabled} onClick={() => setOpen(true)}>{label}</button>
        {receipt && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Request receipt: {receipt}</span>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 320, marginTop: 10 }}>
      <CustomSelect value={method} onChange={setMethod} ariaLabel="Payout method" minWidth="100%" options={PAYOUT_METHODS} />
      <input className="form-input" placeholder="Account holder's name (as it appears on the account)" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} required />
      <input className="form-input" placeholder="Account number / wallet ID / details" value={details} onChange={(e) => setDetails(e.target.value)} required />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} disabled={submitting}>{submitting ? 'Requesting...' : 'Confirm Request'}</button>
        <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => setOpen(false)} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}

// Shared one-shot "pay for this now" trigger — Feature Job purchase, Payslip mark-paid, etc.
// Renders a plain button; expands into a payment-method picker on click.
function PayMethodModalButton({ onSubmit, disabled, label, methods = PAYMENT_METHODS, confirmLabel = 'Confirm' }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(methods[0]?.value || 'other');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try { await onSubmit(method); setOpen(false); } finally { setSubmitting(false); }
  }

  if (!open) {
    return <button type="button" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} disabled={disabled} onClick={() => setOpen(true)}>{label}</button>;
  }

  return (
    <form onSubmit={submit} className="flex items-center flex-wrap" style={{ gap: 6 }}>
      <CustomSelect value={method} onChange={setMethod} ariaLabel="Payment method" minWidth={130} options={methods} />
      <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={submitting}>{submitting ? '...' : confirmLabel}</button>
      <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(false)} disabled={submitting}>Cancel</button>
    </form>
  );
}


function SalaryPayoutProfilePanel({ onFlash }) {
  const [form, setForm] = useState(null);
  useEffect(() => { apiRequest('/institutions/payroll/payout-profile/me').then((data) => setForm({ preferredMethod: data.preferredMethod || 'platform_wallet', bank: data.bank || {}, mobileWallet: data.mobileWallet || {}, crypto: data.crypto || {} })).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (!form) return <p className="admin-notice">Loading salary payout details...</p>;
  const setGroup = (group, key, value) => setForm((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  async function save(e) { e.preventDefault(); try { await apiRequest('/institutions/payroll/payout-profile/me', { method: 'PUT', body: form }); onFlash('Salary payout details saved.', 'success'); return true; } catch (err) { onFlash(err.message); } }
  return <SavedForm value={form} onRestore={setForm} onSubmit={save} className="admin-section" style={{ marginTop: 18 }}>
    <div className="admin-section-heading"><div><h2>Salary Payout Details</h2><p>Save once; institutions will see masked destinations when paying salary.</p></div></div>
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
      <label className="text-xs">Preferred method<select className="form-select" value={form.preferredMethod} onChange={(e) => setForm({ ...form, preferredMethod: e.target.value })}>{[['platform_wallet','CareerZ Wallet'],['stripe_transfer','Stripe Connect'],['bank_transfer','Bank transfer'],['mobile_wallet','Mobile wallet'],['crypto','Crypto wallet'],['cash','Cash']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <input className="form-input" placeholder="Bank name" value={form.bank.bankName || ''} onChange={(e) => setGroup('bank','bankName',e.target.value)} />
      <input className="form-input" placeholder="Bank account title" value={form.bank.accountTitle || ''} onChange={(e) => setGroup('bank','accountTitle',e.target.value)} />
      <input className="form-input" placeholder="IBAN" value={form.bank.iban || ''} onChange={(e) => setGroup('bank','iban',e.target.value)} />
      <input className="form-input" placeholder="Account number" value={form.bank.accountNumber || ''} onChange={(e) => setGroup('bank','accountNumber',e.target.value)} />
      <input className="form-input" placeholder="Mobile wallet provider" value={form.mobileWallet.provider || ''} onChange={(e) => setGroup('mobileWallet','provider',e.target.value)} />
      <input className="form-input" placeholder="Mobile wallet account title" value={form.mobileWallet.accountTitle || ''} onChange={(e) => setGroup('mobileWallet','accountTitle',e.target.value)} />
      <input className="form-input" placeholder="Mobile wallet number" value={form.mobileWallet.number || ''} onChange={(e) => setGroup('mobileWallet','number',e.target.value)} />
      <input className="form-input" placeholder="Crypto asset (USDT/BTC)" value={form.crypto.asset || ''} onChange={(e) => setGroup('crypto','asset',e.target.value)} />
      <input className="form-input" placeholder="Crypto network (TRC20/ERC20)" value={form.crypto.network || ''} onChange={(e) => setGroup('crypto','network',e.target.value)} />
      <input className="form-input" placeholder="Crypto wallet address" value={form.crypto.address || ''} onChange={(e) => setGroup('crypto','address',e.target.value)} />
    </div><button className="btn btn-primary" style={{ marginTop: 12 }}>Save Payout Details</button>
  </SavedForm>;
}

// Real downloadable PDF invoice (unpaid) or receipt (paid) — same jsPDF pattern used for
// payslips/tax reports elsewhere. Receipt includes the QR-verifiable code but never any internal
// platform-commission figures (spec 15D.8).
async function downloadFeePdf(fee) {
  const { jsPDF } = await import('jspdf');
  const QRCode = (await import('qrcode')).default;
  const isPaid = ['paid', 'refunded'].includes(fee.status);
  const pdf = await createBrandedPdf(jsPDF, { title: isPaid ? 'Payment Receipt' : 'Fee Invoice', subtitle: fee.title });
  const verifyUrl = fee.verifyCode ? `${window.location.origin}/verify-fee-receipt/${fee.verifyCode}` : '';
  let y = drawPdfSummary(pdf, [
    { label: 'Document status', value: String(fee.status || 'pending').replaceAll('_', ' ').toUpperCase() },
    { label: 'Due date', value: fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—' },
    { label: 'Academic year', value: fee.academicYear || '—' },
    { label: 'Term / period', value: fee.term || fee.billingPeriod || '—' }
  ]);
  const rows = [
    ['Original amount', `${fee.currency} ${fee.originalAmount ?? fee.amount}`],
    ...(fee.discounts || []).map((d) => [`Discount — ${d.reason || d.kind}`, `-${fee.currency} ${d.amount}`]),
    ...(fee.lateFeeAmount ? [['Late fee', `+${fee.currency} ${fee.lateFeeAmount}`]] : []),
    ['Payable amount', `${fee.currency} ${fee.amount}`], ['Paid amount', `${fee.currency} ${fee.paidAmount || (isPaid ? fee.amount : 0)}`],
    ['Outstanding', `${fee.currency} ${fee.outstandingAmount ?? (isPaid ? 0 : fee.amount)}`]
  ];
  y = drawPdfTable(pdf, { headers: ['Description', 'Amount'], rows, startY: y + 2, widths: [125, 57] });
  if (isPaid) y = drawPdfTable(pdf, { headers: ['Payment detail', 'Value'], rows: [['Receipt number', fee.receiptNumber || '—'], ['Payment method', fee.paidVia || fee.paymentMethod || '—'], ...(fee.paidByInfo ? [['Paid by', `${fee.paidByInfo.name} (${fee.paidByInfo.role})`]] : []), ['Paid at', fee.paidAt ? new Date(fee.paidAt).toLocaleString() : '—']], startY: y + 8, widths: [60, 122] });
  if (isPaid && verifyUrl) {
    const qr = await QRCode.toDataURL(verifyUrl, { errorCorrectionLevel: 'M', margin: 1, width: 320 });
    pdf.addImage(qr, 'PNG', 158, 44, 34, 34); pdf.setFontSize(7); pdf.setTextColor(...PDF_COLORS.muted); pdf.text('Scan to verify', 175, 81, { align: 'center' }); pdf.link(158, 44, 34, 38, { url: verifyUrl });
  }
  addPdfFooter(pdf);
  pdf.save(`${isPaid ? 'receipt' : 'invoice'}-${fee.title.replace(/\s+/g, '-')}.pdf`);
}








// A clickable summary tile: heading, optional count, real body content, and a click-through
// to the tab that owns the full module (matches the spec's "click a card to open its module").
function SummaryCard({ title, count, onClick, children, icon: Icon }) {
  if (Icon) return <button type="button" className="student-metric" onClick={onClick}><span className="student-metric-top"><span className="student-metric-icon"><Icon aria-hidden="true" /></span><FaArrowUpRightFromSquare className="action-arrow" aria-hidden="true" /></span><strong>{count}</strong><span className="student-metric-label">{title}</span></button>;
  return (
    <div className="card reveal in" style={{ padding: 20, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <h4 style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink-soft)', lineHeight: 1.4, marginBottom: 10, overflowWrap: 'anywhere' }}>{title}</h4>
      {count !== undefined && <strong style={{ fontSize: 26, fontFamily: 'Fraunces, serif', display: 'block', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{count}</strong>}
      {children}
    </div>
  );
}





// ---------------------------------------------------------------- Teacher


// Resolves "which institution does this user belong to" for Teacher and Parent Events/Help-Desk
// access (previously neither role had any UI for either module, even though both can be an
// event's audience and both can legitimately raise a help-desk ticket).
function useMyRelatedInstitutionId(onFlash, source) {
  const [institutionId, setInstitutionId] = useState(undefined);
  useEffect(() => {
    if (source === 'teacher') {
      apiRequest('/teacher-employments/mine').then((list) => {
        const active = list.find((e) => e.status === 'active') || list[0];
        setInstitutionId(active?.institution?._id || null);
      }).catch(() => setInstitutionId(null));
    } else {
      apiRequest('/parents/children').then((list) => {
        setInstitutionId(list[0]?.student?.primaryInstitution || null);
      }).catch(() => setInstitutionId(null));
    }
  }, [onFlash, source]);
  return institutionId;
}

// Shared by Teacher and Parent — both were missing any Events/Activities UI even though events
// can target them as audience (spec 15D.17).
function StaffInstitutionEventsPanel({ onFlash, institutionSource, user }) {
  const institutionId = useMyRelatedInstitutionId(onFlash, institutionSource);
  const [events, setEvents] = useState(null);
  const userId = user?._id || '';
  function load() {
    if (!institutionId) return;
    apiRequest(`/institution-ops/${institutionId}/events/public`).then(setEvents).catch((err) => onFlash(err.message));
  }
  useEffect(load, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function rsvp(eventId) { try { await apiRequest(`/institution-ops/events/${eventId}/rsvp`, { method: 'POST' }); onFlash('RSVP recorded.', 'success'); load(); } catch (err) { onFlash(err.message); } }
  async function cancelRsvp(eventId) { try { await apiRequest(`/institution-ops/events/${eventId}/rsvp`, { method: 'DELETE' }); onFlash('RSVP withdrawn.', 'success'); load(); } catch (err) { onFlash(err.message); } }

  if (institutionId === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institutionId) return <p className="admin-notice">No linked institution found yet.</p>;
  return <div><h3 className="font-semibold mb-3">Events & Activities</h3><Table headers={['Event', 'Type', 'Date', 'Venue', 'Status', 'Action']} rows={(events || []).map((event) => {
    const going = (event.rsvps || []).some((entry) => String(entry.user) === String(userId));
    return [event.title, event.type.replaceAll('_', ' '), new Date(event.startDate).toLocaleString(), event.venue || '—', <Tag status="approved" label={event.status} />,
      going ? <button className="btn" onClick={() => cancelRsvp(event._id)}>Cancel RSVP</button> : <button className="btn btn-primary" onClick={() => rsvp(event._id)}>RSVP</button>];
  })} empty="No upcoming events." /></div>;
}

// Shared by Teacher and Parent — both were missing any Help Desk UI even though the backend
// already accepted their tickets (spec 15D.16).
function StaffInstitutionHelpDeskPanel({ onFlash, institutionSource }) {
  const institutionId = useMyRelatedInstitutionId(onFlash, institutionSource);
  const [tickets, setTickets] = useState(null);
  const [form, setForm] = useState({ category: 'academic', subject: '', description: '', priority: 'medium' });
  function load() { apiRequest('/institution-ops/tickets/mine').then(setTickets).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);
  async function submit(e) {
    e.preventDefault();
    try { await apiRequest(`/institution-ops/${institutionId}/tickets`, { method: 'POST', body: form }); onFlash('Help-desk ticket created.', 'success'); setForm({ category: 'academic', subject: '', description: '', priority: 'medium' }); load(); } catch (err) { onFlash(err.message); }
  }
  if (institutionId === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  return <div><h3 className="font-semibold mb-3">Institution Help Desk</h3>
    {institutionId ? <form onSubmit={submit} className="card space-y-3 mb-4" style={{ padding: 18, maxWidth: 620 }}>
      <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{HELPDESK_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
      <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['low', 'medium', 'high', 'urgent'].map((item) => <option key={item}>{item}</option>)}</select>
      <input className="form-input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      <textarea className="form-input" rows={4} placeholder="Describe the issue" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button className="btn btn-primary">Submit Ticket</button>
    </form> : <p className="admin-notice">No linked institution found yet.</p>}
    {tickets === null ? <p role="status" className="admin-notice">Loading tickets...</p> : <Table headers={['Ticket', 'Institution', 'Subject', 'Priority', 'Status', 'Resolution']} rows={tickets.map((ticket) => [ticket.ticketNumber, ticket.institution?.name || '—', ticket.subject, ticket.priority, <Tag status={['resolved', 'closed'].includes(ticket.status) ? 'approved' : 'pending'} label={ticket.status.replace('_', ' ')} />, ticket.resolutionNotes || '—'])} empty="No help-desk tickets." />}
  </div>;
}

// Real BYOK AI Teacher Assistant (spec 14.7/15B.5-15B.6) — Notes, Quiz and Lesson Plan
// generation, routed through the teacher's own connected AI provider.



















// A styled dropdown (button + floating listbox) so the open list follows the app's own
// colors — a native <select>'s popup is OS-rendered and can't be restyled with CSS.
function CustomSelect({ value, onChange, options, ariaLabel, minWidth = 260 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth }}>
      <button
        type="button" className="form-select" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', gap: 10 }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected ? selected.label : 'Select…'}</span>
        <FaChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease', flexShrink: 0, color: 'var(--ink-soft)' }} aria-hidden="true" />
      </button>
      {open && (
        <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30, background: 'var(--paper-raised)', border: '1px solid var(--sand-line)', borderRadius: 14, boxShadow: 'var(--shadow-md)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto', padding: 6 }}>
          {options.map((o) => (
            <div
              key={o.value} role="option" aria-selected={o.value === value} aria-disabled={o.disabled || undefined}
              onClick={() => { if (o.disabled) return; onChange(o.value); setOpen(false); }}
              className={o.disabled ? '' : 'dropdown-option'}
              style={{
                padding: '10px 12px', fontSize: 14, borderRadius: 10,
                cursor: o.disabled ? 'not-allowed' : 'pointer',
                background: o.value === value ? 'var(--sand)' : 'transparent',
                color: o.disabled ? 'var(--ink-soft)' : 'var(--ink)',
                fontWeight: o.value === value ? 600 : 400,
                opacity: o.disabled ? 0.6 : 1
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const COMPLETION_STATUS_LABEL = { in_progress: 'In progress', pending_approval: 'Awaiting your approval', completed: 'Completed' };



















// ---------------------------------------------------------------- Parent


function LiveTransportMap({ ping, vehicle, title = 'Live vehicle location', navigation = false }) {
  const stops = (vehicle?.stopPoints || []).filter((stop) => stop?.name);
  const origin = stops[0]?.name || (vehicle?.routeName ? vehicle.routeName.split(/[–—-]/)[0]?.trim() : '') || 'Starting point not set';
  const destination = stops.at(-1)?.name || (vehicle?.routeName ? vehicle.routeName.split(/[–—-]/).at(-1)?.trim() : '') || 'Destination not set';
  const via = stops.slice(1, -1);
  const directionsUrl = ping?.lat != null && destination !== 'Destination not set'
    ? `https://www.google.com/maps/dir/?api=1&origin=${Number(ping.lat)},${Number(ping.lng)}&destination=${encodeURIComponent(destination)}${via.length ? `&waypoints=${encodeURIComponent(via.map((stop) => stop.name).join('|'))}` : ''}&travelmode=driving`
    : null;
  if (ping?.lat == null || ping?.lng == null) {
    return <div style={{ marginTop: 10 }}><TransportRouteSummary vehicle={vehicle} /><p className="admin-notice" style={{ marginTop: 10 }}>Waiting for the driver’s device GPS…</p></div>;
  }
  const lat = Number(ping.lat);
  const lng = Number(ping.lng);
  return (
    <div style={{ marginTop: 10 }}>
      <TransportRouteSummary vehicle={vehicle} />
      <TransportNavigationMap ping={ping} vehicle={vehicle} navigation={navigation} title={title} />
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 8, marginTop: 6 }}>
        <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>GPS updated {ping.at ? new Date(ping.at).toLocaleTimeString() : 'just now'}</span>
        <div className="flex gap-2">
          {directionsUrl && <a className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} href={directionsUrl} target="_blank" rel="noreferrer">Navigate route</a>}
          <a className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`} target="_blank" rel="noreferrer">Open live location</a>
        </div>
      </div>
    </div>
  );
}

function TransportRouteSummary({ vehicle }) {
  const stops = (vehicle?.stopPoints || []).filter((stop) => stop?.name);
  const routeParts = vehicle?.routeName?.split(/[–—-]/).map((part) => part.trim()).filter(Boolean) || [];
  const origin = stops[0]?.name || routeParts[0] || 'Not set';
  const destination = stops.at(-1)?.name || routeParts.at(-1) || 'Not set';
  const via = stops.slice(1, -1);
  return (
    <div style={{ padding: 12, marginBottom: 10, border: '1px solid var(--sand-line)', borderRadius: 12, background: 'var(--cream, #faf7ef)' }}>
      <div className="flex items-center flex-wrap" style={{ gap: 10 }}>
        <strong className="text-sm"><span style={{ color: 'var(--green)' }}>● FROM</span> {origin}</strong>
        <span aria-hidden="true">→</span>
        {via.map((stop) => <span key={stop.name} className="text-xs">○ {stop.name}{stop.time ? ` (${stop.time})` : ''} →</span>)}
        <strong className="text-sm"><span style={{ color: 'var(--rose)' }}>● TO</span> {destination}</strong>
      </div>
    </div>
  );
}




function ParentPerformancePanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [attendanceRate, setAttendanceRate] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setResults(null);
    apiRequest(`/parents/children/${studentId}/attendance`).then((records) => {
      let present = 0, total = 0;
      records.forEach((r) => r.records.forEach((rec) => {
        const isMine = rec.student === studentId || rec.student?._id === studentId || rec.student?.toString?.() === studentId;
        if (isMine) { total += 1; if (rec.status === 'present') present += 1; }
      }));
      setAttendanceRate(total > 0 ? Math.round((present / total) * 100) : null);
    }).catch(() => setAttendanceRate(null));
    apiRequest(`/parents/children/${studentId}/results`).then(setResults).catch(() => setResults([]));
  }, [studentId]);

  if (children.length === 0) return <p className="admin-notice">No linked children yet — link one from the "My Children" tab first.</p>;

  const avg = results && results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.marksObtained / r.totalMarks) * 100, 0) / results.length) : null;

  return (
    <div>
      <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ maxWidth: 320, marginBottom: 16 }} aria-label="Select child">
        {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
      </select>
      <SummaryRow items={[
        { label: 'Attendance', value: attendanceRate !== null ? `${attendanceRate}%` : null, icon: FaCalendarCheck, detail: 'This term' },
        { label: 'Average Score', value: avg !== null ? `${avg}%` : null, icon: FaChartLine, detail: 'Across all results' },
        { label: 'Results Recorded', value: results?.length, icon: FaAward, detail: 'Total' }
      ]} />
      <Table
        headers={['Term', 'Subject', 'Marks', 'Grade']}
        rows={(results || []).map((r) => [r.term || '—', r.subject || '—', `${r.marksObtained}/${r.totalMarks}`, r.grade || '—'])}
        empty="No results recorded yet."
      />
    </div>
  );
}





const PTM_STATUS_TAG = { pending: 'pending', confirmed: 'approved', declined: 'rejected', cancelled: 'rejected',expired:'rejected',completed:'approved' };

// Shared: meeting minutes + follow-up action items (spec: "PTM ke baad teacher/parent notes aur
// follow-up tasks likh sakein") — only editable once the meeting is actually marked completed.
// Also carries the "mark completed" / (teacher-only) "no-show" actions on a confirmed meeting.
function PtmMeetingDetails({ meeting, myRole, onFlash, onChanged }) {
  const [minutes, setMinutes] = useState(meeting.minutes || '');
  const [savingMinutes, setSavingMinutes] = useState(false);
  const [actionText, setActionText] = useState('');
  const [actionAssignee, setActionAssignee] = useState(myRole === 'teacher' ? 'parent' : 'teacher');

  async function markCompleted() {
    try { await apiRequest(`/ptm/${meeting._id}/complete`, { method: 'PATCH' }); onFlash('Meeting marked completed.', 'success'); onChanged(); } catch (err) { onFlash(err.message); }
  }
  async function markNoShow() {
    try { await apiRequest(`/ptm/${meeting._id}/no-show`, { method: 'PATCH' }); onFlash('Marked as a no-show.', 'success'); onChanged(); } catch (err) { onFlash(err.message); }
  }
  async function saveMinutes() {
    setSavingMinutes(true);
    try { await apiRequest(`/ptm/${meeting._id}/minutes`, { method: 'PATCH', body: { minutes } }); onFlash('Minutes saved.', 'success'); onChanged(); return true; } catch (err) { onFlash(err.message); } finally { setSavingMinutes(false); }
  }
  async function addAction(e) {
    e.preventDefault();
    if (!actionText.trim()) return;
    try { await apiRequest(`/ptm/${meeting._id}/action-items`, { method: 'POST', body: { text: actionText.trim(), assignedTo: actionAssignee } }); setActionText(''); onFlash('Action item added.', 'success'); onChanged(); } catch (err) { onFlash(err.message); }
  }
  async function toggleAction(itemId, done) {
    try { await apiRequest(`/ptm/${meeting._id}/action-items/${itemId}`, { method: 'PATCH', body: { done } }); onChanged(); } catch (err) { onFlash(err.message); }
  }

  if (meeting.status === 'confirmed') {
    return (
      <div className="flex gap-2" style={{ marginTop: 8 }}>
        <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={markCompleted}>Mark Completed</button>
        {myRole === 'teacher' && <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--rose)' }} onClick={markNoShow}>Mark No-Show</button>}
      </div>
    );
  }
  if (meeting.status !== 'completed') return null;

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--sand-line)' }}>
      {meeting.noShow && <Tag status="rejected" label="No-show" />}
      <label className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, margin: '8px 0 4px' }}>Meeting Minutes</label>
      <SavedForm key={meeting._id} saved={Boolean(meeting.minutes)} value={minutes} onRestore={setMinutes} onSubmit={saveMinutes}><textarea className="form-input" rows={2} value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="What was discussed..." />
      <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem', marginTop: 4 }} disabled={savingMinutes}>Save Minutes</button></SavedForm>

      <label className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, margin: '10px 0 4px' }}>Follow-up Action Items</label>
      {(meeting.actionItems || []).map((item) => (
        <div key={item._id} className="flex items-center gap-2" style={{ fontSize: 12, marginBottom: 4 }}>
          <input type="checkbox" checked={item.done} onChange={(e) => toggleAction(item._id, e.target.checked)} />
          <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.text} <em style={{ color: 'var(--ink-soft)' }}>({item.assignedTo})</em></span>
        </div>
      ))}
      <form onSubmit={addAction} className="flex gap-2 items-end flex-wrap" style={{ marginTop: 6 }}>
        <input className="form-input" placeholder="New action item..." value={actionText} onChange={(e) => setActionText(e.target.value)} style={{ minWidth: 180, flex: 1, fontSize: '0.78rem' }} />
        <select className="form-select" value={actionAssignee} onChange={(e) => setActionAssignee(e.target.value)} style={{ fontSize: '0.78rem' }}>
          <option value="parent">Parent</option>
          <option value="teacher">Teacher</option>
        </select>
        <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Add</button>
      </form>
    </div>
  );
}





function ParentPaymentRecordsPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [fees, setFees] = useState(null);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setFees(null);
    apiRequest(`/parents/children/${studentId}/fees`).then(setFees).catch(() => setFees([]));
  }, [studentId]);

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  const paid = (fees || []).filter((f) => f.status === 'paid');
  const selectedChild = children.find((c) => c.student._id === studentId);

  return (
    <div>
      {children.length > 1 ? (
        <label style={{ display: 'inline-block', marginBottom: 18 }}>
          <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Viewing child</span>
          <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ minWidth: 240 }} aria-label="Select child">
            {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
          </select>
        </label>
      ) : selectedChild && (
        <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{selectedChild.student.fullName[0]}</span>
          <strong className="text-sm">{selectedChild.student.fullName}</strong>
        </div>
      )}
      <h3 className="font-semibold mb-2">Payment Records</h3>
      <Table
        headers={['Title', 'Gross Amount', 'Platform Commission', 'Net Amount', 'Paid Via', 'Paid On', 'Escrow', 'Receipt']}
        rows={paid.map((f) => [
          f.title, `${f.currency} ${f.grossAmount ?? f.amount}`,
          `${f.currency} ${f.platformCommission ?? 0}`,
          `${f.currency} ${f.netAmount ?? f.amount}`,
          <span>{f.paidVia || '—'}{f.paidByInfo && <><br /><span className="text-xs">by {f.paidByInfo.name} ({f.paidByInfo.role})</span></>}</span>, f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '—',
          <Tag status={f.escrowStatus === 'released' ? 'approved' : 'pending'} label={f.escrowStatus === 'released' ? 'Released' : 'Held'} />,
          f.transactionId || '—'
        ])}
        empty="No completed payments yet — outstanding fees are on the Fee Management page."
      />
    </div>
  );
}

function ParentChildPicker({ children, studentId, setStudentId }) {
  if (children.length === 0) return null;
  const selected = children.find((c) => c.student._id === studentId);
  return children.length > 1 ? (
    <label style={{ display: 'inline-block', marginBottom: 18 }}>
      <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Viewing child</span>
      <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ minWidth: 240 }} aria-label="Select child">
        {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
      </select>
    </label>
  ) : selected ? (
    <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{selected.student.fullName[0]}</span>
      <strong className="text-sm">{selected.student.fullName}</strong><StudentGuardians studentId={selected.student._id}/>
    </div>
  ) : null;
}

// Health Record (spec Part 11.13) — optional, parent-managed. Only the linked parent and
// authorized institution staff can see this; it's never public.
function ParentHealthPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = children.find((c) => c.student._id === studentId);
  const isSponsor = selected?.relationship === 'sponsor';

  const [extra, setExtra] = useState({ vaccinations: [], incidents: [] });

  useEffect(() => {
    if (!studentId || isSponsor) return;
    setForm(null);
    apiRequest(`/parents/children/${studentId}/health`).then((h) => {
      setForm({
        bloodGroup: h.bloodGroup || '',
        allergies: (h.allergies || []).join(', '),
        medicalNotes: h.medicalNotes || '',
        emergencyName: h.emergencyContact?.name || '',
        emergencyPhone: h.emergencyContact?.phone || '',
        emergencyRelation: h.emergencyContact?.relation || ''
      });
      // Vaccinations/incidents were previously not returned to parents at all — a parent could
      // only learn about an incident from the one-off notification email, with no lasting record.
      setExtra({ vaccinations: h.vaccinations || [], incidents: h.incidents || [] });
    }).catch((err) => onFlash(err.message));
  }, [studentId, isSponsor, onFlash]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest(`/parents/children/${studentId}/health`, {
        method: 'PATCH',
        body: {
          bloodGroup: form.bloodGroup,
          allergies: form.allergies.split(',').map((a) => a.trim()).filter(Boolean),
          medicalNotes: form.medicalNotes,
          emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone, relation: form.emergencyRelation }
        }
      });
      onFlash('Health record updated.', 'success'); return true;
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  return (
    <div>
      <ParentChildPicker children={children} studentId={studentId} setStudentId={setStudentId} />
      {isSponsor ? (
        <div className="admin-notice">Sponsor links cannot view or edit health records — this is limited to a father, mother or guardian link.</div>
      ) : (
      <>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Only you and your child's authorized institution staff can see this — it is never shown publicly.</p>
      {!form ? <p role="status" className="admin-notice">Loading...</p> : (
        <SavedForm key={studentId} value={form} onRestore={setForm} onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 440, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Blood Group
            <input className="form-input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} style={{ marginTop: 6 }} placeholder="e.g. O+" />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Allergies (comma-separated)
            <input className="form-input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} style={{ marginTop: 6 }} placeholder="e.g. Peanuts, Penicillin" />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Medical Notes
            <textarea className="form-input" rows={3} value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} style={{ marginTop: 6 }} />
          </label>
          <div className="flex gap-2 flex-wrap">
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px' }}>Emergency Contact Name
              <input className="form-input" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} style={{ marginTop: 6 }} />
            </label>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px' }}>Phone
              <input className="form-input" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} style={{ marginTop: 6 }} />
            </label>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px' }}>Relation
              <input className="form-input" value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} style={{ marginTop: 6 }} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '9px 20px', justifySelf: 'start' }} disabled={saving}>{saving ? 'Saving...' : 'Save Health Record'}</button>
        </SavedForm>
      )}
      <h4 className="font-semibold mt-6 mb-2">Vaccination History</h4>
      <Table headers={['Vaccine', 'Date', 'Notes']} rows={extra.vaccinations.map((v) => [v.name, v.date ? new Date(v.date).toLocaleDateString() : '—', v.notes || '—'])} empty="No vaccination records on file." />
      <h4 className="font-semibold mt-6 mb-2">Incident History</h4>
      <Table headers={['Date', 'Severity', 'Description', 'Action Taken']} rows={extra.incidents.map((i) => [new Date(i.occurredAt).toLocaleDateString(), <Tag status={i.severity === 'severe' ? 'rejected' : i.severity === 'moderate' ? 'pending' : 'approved'} label={i.severity} />, i.description, i.actionTaken || '—'])} empty="No incidents on file." />
      </>
      )}
    </div>
  );
}

const PERMISSION_TYPES = [
  { value: 'trip', label: 'School Trip' },
  { value: 'event', label: 'Event' },
  { value: 'competition', label: 'Competition' },
  { value: 'photo', label: 'Photo / Media Use' },
  { value: 'medical', label: 'Medical Treatment' },
  { value: 'other', label: 'Other' }
];

// Digital permission slip (spec Part 11.14) — replaces the paper permission-slip workflow with
// a typed e-signature (full name) + timestamp.
function ParentPermissionsPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [list, setList] = useState(null);
  const [form, setForm] = useState({ type: 'trip', title: '', details: '', decision: 'granted', signedName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest('/parents/children').then((l) => {
      setChildren(l);
      if (l[0]) setStudentId(l[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reload() {
    if (!studentId) return;
    apiRequest(`/parents/children/${studentId}/permissions`).then(setList).catch((err) => onFlash(err.message));
  }
  useEffect(() => { setList(null); reload(); }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.signedName.trim()) return onFlash('Title and your typed signature are required.');
    setSubmitting(true);
    try {
      await apiRequest(`/parents/children/${studentId}/permissions`, { method: 'POST', body: form });
      onFlash('Permission recorded.', 'success');
      setForm({ type: 'trip', title: '', details: '', decision: 'granted', signedName: '' });
      reload();
    } catch (err) { onFlash(err.message); } finally { setSubmitting(false); }
  }

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  const selected = children.find((c) => c.student._id === studentId);
  const isSponsor = selected?.relationship === 'sponsor';

  return (
    <div>
      <ParentChildPicker children={children} studentId={studentId} setStudentId={setStudentId} />
      {isSponsor ? (
        <div className="admin-notice" style={{ marginBottom: 20 }}>Sponsor links cannot sign consent for trips, events or medical treatment — this is limited to a father, mother or guardian link. You can still view the permission history below.</div>
      ) : (
      <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 460, marginBottom: 28, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
        <CustomSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} ariaLabel="Permission type" minWidth="100%" options={PERMISSION_TYPES} />
        <input className="form-input" placeholder="Title (e.g. Grade 8 Museum Trip — 20 Oct)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="form-input" placeholder="Details (optional)" rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
        <div className="flex gap-2">
          <button type="button" className={`btn ${form.decision === 'granted' ? 'btn-primary' : ''}`} onClick={() => setForm({ ...form, decision: 'granted' })}>Grant Permission</button>
          <button type="button" className={`btn ${form.decision === 'denied' ? 'btn-primary' : ''}`} onClick={() => setForm({ ...form, decision: 'denied' })}>Deny Permission</button>
        </div>
        <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Type your full name to sign
          <input className="form-input" value={form.signedName} onChange={(e) => setForm({ ...form, signedName: e.target.value })} style={{ marginTop: 6 }} placeholder="Your full legal name" required />
        </label>
        <button type="submit" className="btn btn-primary" style={{ padding: '9px 20px', justifySelf: 'start' }} disabled={submitting}>{submitting ? 'Recording...' : 'Sign & Submit'}</button>
      </form>
      )}
      <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>Permission History</h4>
      <Table
        loading={list === null}
        headers={['Type', 'Title', 'Decision', 'Signed By', 'Date']}
        rows={(list || []).map((p) => [
          PERMISSION_TYPES.find((t) => t.value === p.type)?.label || p.type, p.title,
          <Tag status={p.decision === 'granted' ? 'approved' : 'rejected'} />,
          p.signedName, new Date(p.signedAt).toLocaleDateString()
        ])}
        empty="No permission slips recorded yet."
      />
    </div>
  );
}



// ------------------------------------------------------------ Institution


// ------------------------------------------------------------ Institute Representative
// A limited institution-staff dashboard — no payroll/finance/full-staff-management access.
// Everything reads/writes real Inquiry/InstitutionApplication/Meeting/VirtualFair data.



















function useMyInstitution(onFlash) {
  const [institution, setInstitution] = useState(undefined);
  useEffect(() => {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return institution;
}







// Institution<->Employer placement office (spec: "placement office, employer partnerships,
// campus recruitment, student referrals/placement tracking") — request/manage employer
// partnerships, refer real students to real jobs at partnered employers, track real outcomes.
function InstitutionPlacementPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [partnerships, setPartnerships] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [employerEmail, setEmployerEmail] = useState('');
  const [referForm, setReferForm] = useState({ studentId: '', jobId: '' });

  function load(id) {
    apiRequest('/institution-employer/partnerships/mine').then(setPartnerships).catch(() => setPartnerships([]));
    apiRequest(`/institution-employer/referrals/institution/${id}`).then(setPlacement).catch(() => setPlacement({ referrals: [], stats: {} }));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function requestPartnership(e) {
    e.preventDefault();
    if (!employerEmail.trim()) return;
    try {
      await apiRequest('/institution-employer/partnerships', { method: 'POST', body: { institutionId: institution._id, employerEmail: employerEmail.trim() } });
      onFlash('Partnership request sent.', 'success');
      setEmployerEmail('');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }
  async function refer(e) {
    e.preventDefault();
    if (!referForm.studentId.trim() || !referForm.jobId.trim()) return onFlash('Select a student and enter a Job ID.');
    try {
      await apiRequest('/institution-employer/referrals', { method: 'POST', body: { studentId: referForm.studentId.trim(), jobId: referForm.jobId.trim() } });
      onFlash('Referral created — the student was notified.', 'success');
      setReferForm({ studentId: '', jobId: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }
  async function endPartnership(id) {
    const confirmed = await showConfirm('End this active partnership? Referrals to that employer\'s jobs will no longer be possible.', { confirmLabel: 'End partnership' });
    if (!confirmed) return;
    try { await apiRequest(`/institution-employer/partnerships/${id}/end`, { method: 'PATCH' }); onFlash('Partnership ended.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }
  // An employer asked to partner: the institute accepts or declines here.
  async function respondPartnership(id, decision) {
    try { await apiRequest(`/institution-employer/partnerships/${id}/respond`, { method: 'PATCH', body: { decision } }); onFlash(decision === 'active' ? 'Partnership accepted. You can now refer students to this employer’s jobs.' : 'Partnership declined.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }
  async function declineReferral(id) {
    try { await apiRequest(`/institution-employer/referrals/${id}/decline`, { method: 'PATCH' }); onFlash('Referral withdrawn.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  const PARTNER_STATUS_TAG = { requested: 'pending', active: 'approved', declined: 'rejected', ended: 'rejected' };
  const REFERRAL_STATUS_TAG = { referred: 'pending', applied: 'pending', hired: 'approved', declined: 'rejected' };

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Placement Office</h3>

      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Employer Partnerships</h2><p>A real, consent-based relationship — referrals only work with an active partnership.</p></div></div>
        <form onSubmit={requestPartnership} className="flex gap-2 items-end mb-3">
          <input className="form-input" type="email" placeholder="Employer's account email" value={employerEmail} onChange={(e) => setEmployerEmail(e.target.value)} style={{ minWidth: 240 }} />
          <button type="submit" className="btn btn-primary">Request Partnership</button>
        </form>
        <Table
          loading={partnerships === null}
          headers={['Employer', 'Status', 'Action']}
          rows={(partnerships || []).map((p) => [
            p.employer?.companyName || p.employer?.fullName, <Tag status={PARTNER_STATUS_TAG[p.status] || 'pending'} label={p.status} />,
            p.canRespond ? <div className="flex gap-2"><button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondPartnership(p._id, 'active')}>Accept</button><button className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondPartnership(p._id, 'declined')}>Decline</button></div>
              : p.status === 'active' ? <button className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => endPartnership(p._id)}>End Partnership</button> : p.status === 'requested' ? 'Waiting for the employer' : '—'
          ])}
          empty="No partnerships yet."
        />
      </div>

      <div className="admin-section" style={{ marginTop: 16 }}>
        <div className="admin-section-heading"><div><h2>Refer a Student</h2><p>Recommends a real student for a real job — the student still applies themselves.</p></div></div>
        <form onSubmit={refer} className="flex gap-2 items-end mb-3 flex-wrap">
          <InstitutionStudentSelect institutionId={institution._id} value={referForm.studentId} onChange={(v) => setReferForm({ ...referForm, studentId: v })} />
          <input className="form-input" placeholder="Job ID" value={referForm.jobId} onChange={(e) => setReferForm({ ...referForm, jobId: e.target.value })} style={{ minWidth: 200 }} />
          <button type="submit" className="btn btn-primary">Refer</button>
        </form>
        {placement?.stats && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 10 }}>Total referrals: {placement.stats.total || 0} · Applied: {placement.stats.applied || 0} · Placed: {placement.stats.placed || 0}</p>}
        <Table
          loading={placement === null}
          headers={['Student', 'Job', 'Status', 'Referred', 'Action']}
          rows={(placement?.referrals || []).map((r) => [
            r.student?.fullName, `${r.job?.title} @ ${r.job?.company}`,
            <Tag status={REFERRAL_STATUS_TAG[r.status] || 'pending'} label={r.status} />,
            new Date(r.createdAt).toLocaleDateString(),
            r.status === 'referred' ? <button className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => declineReferral(r._id)}>Withdraw</button> : '—'
          ])}
          empty="No referrals yet."
        />
      </div>
      <InstitutionInternshipCertificate institutionId={institution._id} StudentSelect={InstitutionStudentSelect} onFlash={onFlash} />
    </div>
  );
}



const FEE_TYPES = ['tuition', 'admission', 'exam', 'hostel', 'transport', 'library', 'activity', 'other'];

















// ==================== Admission Management (spec 15D.3) ====================


// ==================== Library Management (spec 15D.10) ====================






// ==================== Hostel Management (spec 15D.11) ====================

// Dropdown of this institution's own active students (never a raw pasted User ID) — reused by
// Hostel allocation/transfer and Transport assignment, both of which used to just take a text
// User ID with no membership guarantee at all.
function InstitutionStudentSelect({ institutionId, value, onChange, placeholder }) {
  const [students, setStudents] = useState(null);
  useEffect(() => {
    apiRequest(`/institutions/${institutionId}/students`).then(setStudents).catch(() => setStudents([]));
  }, [institutionId]);
  return (
    <select className="form-select" style={{ minWidth: 160, padding: '4px 6px', fontSize: '0.72rem' }} value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder || 'Select student'}</option>
      {(students || []).map((s) => <option key={s.user._id} value={s.user._id}>{s.user.fullName} ({s.rollNumber || s.user.email})</option>)}
    </select>
  );
}





// ==================== Transport Management (spec 15D.12) ====================





// ==================== Inventory Management (spec 15D.13) ====================

function InstitutionInventoryPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'other', quantity: 1, location: '', condition: 'good', purchaseDate: '', purchaseCost: '', notes: '' });

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/inventory`).then(setItems).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addItem(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/inventory`, { method: 'POST', body: { ...form, quantity: Number(form.quantity), purchaseCost: Number(form.purchaseCost || 0), purchaseDate: form.purchaseDate || null } });
      onFlash('Item added.', 'success');
      setForm({ name: '', category: 'other', quantity: 1, location: '', condition: 'good', purchaseDate: '', purchaseCost: '', notes: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function removeItem(id) {
    try { await apiRequest(`/institution-ops/inventory/${id}`, { method: 'DELETE' }); onFlash('Item removed.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function editItem(item) {
    const quantity = await showPrompt('Quantity:', String(item.quantity));
    if (quantity === null) return;
    const location = await showPrompt('Location:', item.location || '');
    if (location === null) return;
    const purchaseCost = await showPrompt('Unit cost (PKR):', String(item.purchaseCost || 0));
    if (purchaseCost === null) return;
    try {
      await apiRequest(`/institution-ops/inventory/${item._id}`, { method: 'PATCH', body: { quantity: Number(quantity), location, purchaseCost: Number(purchaseCost) } });
      onFlash('Item updated.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={addItem} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['computer', 'projector', 'furniture', 'lab_equipment', 'sports_equipment', 'other'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <input className="form-input" type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={{ maxWidth: 100 }} />
        <input className="form-input" placeholder="Location (e.g. Lab 2)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input className="form-input" type="number" min="0" placeholder="Unit cost (PKR)" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} style={{ maxWidth: 160 }} />
        <label className="text-xs">Purchase date<input className="form-input" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} style={{ marginTop: 4 }} /></label>
        <select className="form-select" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
          {['new', 'good', 'needs_repair', 'damaged'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Add Item</button>
      </form>
      <Table
        headers={['Name', 'Category', 'Qty', 'Location', 'Condition', 'Unit cost', 'Total value', 'Purchased', 'Action']}
        rows={(items || []).map((i) => [
          i.name, i.category.replace('_', ' '), i.quantity, i.location || '—',
          <Tag status={i.condition === 'damaged' ? 'rejected' : i.condition === 'needs_repair' ? 'pending' : 'approved'} label={i.condition.replace('_', ' ')} />,
          `PKR ${Number(i.purchaseCost || 0).toLocaleString()}`, `PKR ${(Number(i.purchaseCost || 0) * Number(i.quantity || 0)).toLocaleString()}`, i.purchaseDate ? new Date(i.purchaseDate).toLocaleDateString() : '—',
          <div className="flex gap-1"><button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => editItem(i)}>Edit</button><button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => removeItem(i._id)}>Remove</button></div>
        ])}
        empty="No inventory items added yet."
      />
    </div>
  );
}

// ==================== Medical & Health (spec 15D.14) ====================

function InstitutionHealthPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [incidents, setIncidents] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [health, setHealth] = useState(null);
  const [savingHealth, setSavingHealth] = useState(false);
  const [form, setForm] = useState({ student: '', description: '', actionTaken: '', severity: 'minor', occurredAt: '' });

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/health-incidents`).then(setIncidents).catch((err) => onFlash(err.message));
    apiRequest(`/institutions/${instId}/students`).then((list) => {
      setStudents(list);
      setSelectedStudent((current) => current || list[0]?.user?._id || '');
    }).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  useEffect(() => {
    if (!selectedStudent) { setHealth(null); return; }
    setHealth(null);
    apiRequest(`/institution-ops/students/${selectedStudent}/health`).then((record) => setHealth({
      bloodGroup: record.bloodGroup || '',
      allergies: (record.allergies || []).join(', '),
      medicalNotes: record.medicalNotes || '',
      vaccinations: record.vaccinations || [],
      emergencyContact: record.emergencyContact || { name: '', phone: '', relation: '' }
    })).catch((err) => onFlash(err.message));
  }, [selectedStudent, onFlash]);

  async function saveHealthRecord(e) {
    e.preventDefault();
    if (!selectedStudent || !health) return;
    setSavingHealth(true);
    try {
      await apiRequest(`/institution-ops/students/${selectedStudent}/health`, {
        method: 'PATCH',
        body: {
          bloodGroup: health.bloodGroup,
          allergies: health.allergies.split(',').map((value) => value.trim()).filter(Boolean),
          medicalNotes: health.medicalNotes,
          vaccinations: health.vaccinations.filter((item) => item.name?.trim()).map((item) => ({ ...item, name: item.name.trim(), date: item.date || null })),
          emergencyContact: health.emergencyContact
        }
      });
      onFlash('Student health record updated.', 'success'); return true;
    } catch (err) { onFlash(err.message); } finally { setSavingHealth(false); }
  }

  function updateVaccination(index, field, value) {
    setHealth((current) => ({ ...current, vaccinations: current.vaccinations.map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  }

  async function addIncident(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/health-incidents`, { method: 'POST', body: form });
      onFlash('Health incident recorded — parent notified.', 'success');
      setForm({ student: '', description: '', actionTaken: '', severity: 'minor', occurredAt: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <div className="admin-section" style={{ marginBottom: 18 }}>
        <div className="admin-section-heading"><div><h2>Student Health Record</h2><p>Private medical information visible only to authorized institution staff and the student's guardian.</p></div></div>
        <select className="form-select" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ minWidth: 260, marginBottom: 14 }}>
          <option value="">Select student</option>
          {students.map((student) => <option key={student.user?._id} value={student.user?._id}>{student.user?.fullName} {student.rollNumber ? `(${student.rollNumber})` : ''}</option>)}
        </select>
        {selectedStudent && !health && <p role="status" className="admin-notice">Loading health record...</p>}
        {health && <SavedForm key={selectedStudent} value={health} onRestore={setHealth} onSubmit={saveHealthRecord} className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <input className="form-input" placeholder="Blood group (e.g. O+)" value={health.bloodGroup} onChange={(e) => setHealth({ ...health, bloodGroup: e.target.value })} />
            <input className="form-input" placeholder="Allergies (comma-separated)" value={health.allergies} onChange={(e) => setHealth({ ...health, allergies: e.target.value })} style={{ minWidth: 280 }} />
          </div>
          <textarea className="form-input" rows={3} placeholder="Medical history / notes" value={health.medicalNotes} onChange={(e) => setHealth({ ...health, medicalNotes: e.target.value })} />
          <div className="flex gap-3 flex-wrap">
            <input className="form-input" placeholder="Emergency contact name" value={health.emergencyContact.name || ''} onChange={(e) => setHealth({ ...health, emergencyContact: { ...health.emergencyContact, name: e.target.value } })} />
            <input className="form-input" placeholder="Emergency phone" value={health.emergencyContact.phone || ''} onChange={(e) => setHealth({ ...health, emergencyContact: { ...health.emergencyContact, phone: e.target.value } })} />
            <input className="form-input" placeholder="Relationship" value={health.emergencyContact.relation || ''} onChange={(e) => setHealth({ ...health, emergencyContact: { ...health.emergencyContact, relation: e.target.value } })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><strong className="text-sm">Vaccinations</strong><button type="button" className="btn" onClick={() => setHealth({ ...health, vaccinations: [...health.vaccinations, { name: '', date: '', notes: '' }] })}>Add vaccination</button></div>
            {health.vaccinations.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No vaccination records added.</p>}
            {health.vaccinations.map((item, index) => <div key={index} className="flex gap-2 items-center flex-wrap mb-2">
              <input className="form-input" placeholder="Vaccine name" value={item.name || ''} onChange={(e) => updateVaccination(index, 'name', e.target.value)} />
              <input className="form-input" type="date" value={item.date ? String(item.date).slice(0, 10) : ''} onChange={(e) => updateVaccination(index, 'date', e.target.value)} />
              <input className="form-input" placeholder="Notes" value={item.notes || ''} onChange={(e) => updateVaccination(index, 'notes', e.target.value)} />
              <button type="button" className="btn" onClick={() => setHealth({ ...health, vaccinations: health.vaccinations.filter((_, i) => i !== index) })}>Remove</button>
            </div>)}
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingHealth}>{savingHealth ? 'Saving...' : 'Save Health Record'}</button>
        </SavedForm>}
      </div>
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Report a Health Incident</h2><p>Parent is automatically notified when you record an incident.</p></div></div>
        <form onSubmit={addIncident} className="flex gap-3 items-end mb-3 flex-wrap">
          <select className="form-select" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
            <option value="">Select student</option>
            {students.map((student) => <option key={student.user?._id} value={student.user?._id}>{student.user?.fullName} {student.rollNumber ? `(${student.rollNumber})` : ''}</option>)}
          </select>
          <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {['minor', 'moderate', 'severe'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="form-input" placeholder="What happened" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ minWidth: 220 }} />
          <input className="form-input" placeholder="Action taken" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} />
          <input className="form-input" type="datetime-local" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} title="Incident date and time (optional)" />
          <button type="submit" className="btn btn-primary">Record Incident</button>
        </form>
      </div>
      <Table
        headers={['Student', 'Date', 'Severity', 'Description', 'Action Taken', 'Parent Notified']}
        rows={(incidents || []).map((i) => [
          i.student?.fullName, new Date(i.occurredAt).toLocaleDateString(),
          <Tag status={i.severity === 'severe' ? 'rejected' : i.severity === 'moderate' ? 'pending' : 'approved'} label={i.severity} />,
          i.description, i.actionTaken || '—', i.parentNotified ? 'Yes' : 'No'
        ])}
        empty="No health incidents recorded."
      />
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>Health records and emergency incidents are stored separately so routine medical details remain editable without changing the incident audit history.</p>
    </div>
  );
}

// ==================== Events & Activities (spec 15D.17) ====================

const EVENT_TYPES = ['sports_day', 'annual_function', 'seminar', 'workshop', 'competition', 'parent_meeting', 'convocation', 'other'];

function InstitutionEventsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [events, setEvents] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'other', startDate: '', endDate: '', venue: '', description: '', audience: [], isPublic: false });

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/events`).then(setEvents).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addEvent(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/events`, { method: 'POST', body: { ...form, startDate: new Date(form.startDate).toISOString() } });
      onFlash('Event created.', 'success');
      setForm({ title: '', type: 'other', startDate: '', endDate: '', venue: '', description: '', audience: [], isPublic: false });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function cancelEvent(id) {
    try { await apiRequest(`/institution-ops/events/${id}`, { method: 'PATCH', body: { status: 'cancelled' } }); onFlash('Event cancelled.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={addEvent} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input className="form-input" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input className="form-input" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} title="End date (optional)" />
        <input className="form-input" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        <input className="form-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {['students', 'parents', 'teachers', 'staff'].map((audience) => <label key={audience} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.audience.includes(audience)} onChange={(e) => setForm({ ...form, audience: e.target.checked ? [...form.audience, audience] : form.audience.filter((item) => item !== audience) })} />{audience}</label>)}
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} /> Show on the public Events page</label>
        <button type="submit" className="btn btn-primary">Create Event</button>
      </form>
      <Table
        headers={['Title', 'Type', 'Date', 'Venue', 'RSVPs', 'Status', 'Action']}
        rows={(events || []).map((ev) => [
          ev.title, ev.type.replace('_', ' '), new Date(ev.startDate).toLocaleString(), ev.venue || '—', (ev.rsvps || []).length,
          <Tag status={ev.status === 'cancelled' ? 'rejected' : 'approved'} label={ev.status} />,
          ev.status !== 'cancelled' ? <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => cancelEvent(ev._id)}>Cancel</button> : '—'
        ])}
        empty="No events created yet."
      />
    </div>
  );
}

// ==================== Complaint & Help Desk (spec 15D.16) ====================

const HELPDESK_CATEGORIES = ['academic', 'fee', 'teacher', 'student', 'staff', 'technical', 'harassment', 'discipline'];

function InstitutionHelpDeskPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [tickets, setTickets] = useState(null);
  const [assignPick, setAssignPick] = useState({}); // ticketId -> picked person

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/tickets`).then(setTickets).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function update(id, status) {
    let resolutionNotes;
    if (status === 'resolved') {
      resolutionNotes = await showPrompt('Explain how this complaint was resolved. The person who raised it will see these notes.', { title: 'Resolve ticket', required: true, confirmLabel: 'Resolve' });
      if (!resolutionNotes) return;
    }
    try { await apiRequest(`/institution-ops/tickets/${id}`, { method: 'PATCH', body: { status, resolutionNotes } }); onFlash(`Ticket marked ${status.replace('_', ' ')}.`, 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function assign(id, person) {
    try { await apiRequest(`/institution-ops/tickets/${id}`, { method: 'PATCH', body: { assignedTo: person._id } }); onFlash(`Assigned to ${person.fullName}.`, 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <Table
        headers={['Ticket #', 'Raised By', 'Category', 'Subject', 'Priority', 'Status', 'Assigned', 'Action']}
        rows={(tickets || []).map((t) => [
          t.ticketNumber, t.raisedBy?.fullName, t.category, t.subject,
          <Tag status={t.priority === 'urgent' ? 'rejected' : t.priority === 'high' ? 'pending' : 'approved'} label={t.priority} />,
          <Tag status={t.status === 'resolved' || t.status === 'closed' ? 'approved' : 'pending'} label={t.status.replace('_', ' ')} />,
          t.assignedTo?.fullName ? t.assignedTo.fullName : (
            !['resolved', 'closed'].includes(t.status) ? <PersonPicker selected={assignPick[t._id]} onPick={(p) => { setAssignPick((s) => ({ ...s, [t._id]: p })); assign(t._id, p); }} onClear={() => setAssignPick((s) => ({ ...s, [t._id]: null }))} placeholder="Assign to staff" /> : '—'
          ),
          !['resolved', 'closed'].includes(t.status) ? (
            <div className="flex gap-1">
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => update(t._id, 'in_progress')}>In Progress</button>
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => update(t._id, 'resolved')}>Resolve</button>
            </div>
          ) : t.status === 'resolved' ? <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => update(t._id, 'closed')}>Close</button> : '—'
        ])}
        empty="No help desk tickets yet."
      />
    </div>
  );
}

// ==================== AI Operations Assistant (spec 15D.19) ====================








const DOW_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const DOW_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

// <input type="time"> always stores/submits 24-hour "HH:MM" regardless of locale — this is purely
// a display-only conversion to 12-hour AM/PM for the timetable table (backend keeps storing 24hr).
function formatTime12h(hhmm) {
  if (!hhmm) return hhmm;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// The timetable is a recurring weekly template (no per-session date), so we derive the actual
// next calendar date a given weekday+time next occurs — a real date, not just a day name.
function nextDateForDow(dow, startTime) {
  const now = new Date();
  const [h, m] = (startTime || '0:0').split(':').map(Number);
  const target = DOW_INDEX[dow];
  if (target === undefined) return null;
  const date = new Date(now);
  let daysAhead = (target - now.getDay() + 7) % 7;
  date.setDate(now.getDate() + daysAhead);
  date.setHours(h || 0, m || 0, 0, 0);
  if (daysAhead === 0 && date < now) date.setDate(date.getDate() + 7);
  return date;
}





// ---------------------------------------------------------------- Employer





function EmployerEmploymentsPanel({ onFlash, employer = null }) {
  const [employments, setEmployments] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() { apiRequest(employer ? `/employment/posted?employer=${employer}` : '/employment/posted').then(setEmployments).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);

  async function endEmployment(id) {
    const reason = await showPrompt('Add a reason for ending this employment, or continue without one.', { title: 'End employment', placeholder: 'Reason (optional)', confirmLabel: 'End employment', danger: true });
    if (reason === null) return;
    setBusyId(id);
    try {
      await apiRequest(`/employment/${id}/terminate`, { method: 'PATCH', body: { reason } });
      onFlash('Employment ended.', 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  const STATUS_TAG = { offered: 'pending', active: 'approved', declined: 'rejected', resigned: 'pending', terminated: 'rejected' };

  return (
    <div>
      <h3 className="font-semibold mb-2">Employees</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>Every candidate marked "hired" gets a real offer here they must accept before becoming active.</p>
      <Table
        loading={employments === null}
        headers={['Candidate', 'Job', 'Status', 'Salary', 'Started', 'Ended', 'Action']}
        rows={(employments || []).map((e) => [
          e.employee?.fullName || e.employee?.email, e.job?.title,
          <Tag status={STATUS_TAG[e.status] || 'pending'} label={e.status} />,
          e.salary ? `${e.currency} ${e.salary}` : '—',
          e.startDate ? new Date(e.startDate).toLocaleDateString() : '—',
          e.endedAt ? `${new Date(e.endedAt).toLocaleDateString()}${e.endReason ? ` (${e.endReason})` : ''}` : '—',
          e.status === 'active'
            ? <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => endEmployment(e._id)}>End employment</button>
            : '—'
        ])}
        empty={'No employment records yet — mark a candidate "Hired" in My Jobs to create one.'}
      />
    </div>
  );
}


const JOB_TYPES = ['full_time', 'part_time', 'internship', 'freelance', 'government', 'ngo'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const JOB_CATEGORIES = [['teaching', 'Teaching'], ['academic_leadership', 'Principal / academic leadership'], ['administration', 'Administration / office'], ['finance_accounts', 'Finance & accounts'], ['it_technical', 'IT & technical'], ['transport', 'Transport / driver'], ['hostel', 'Hostel / warden'], ['security', 'Security'], ['library', 'Library'], ['lab', 'Laboratory'], ['maintenance_cleaning', 'Maintenance & cleaning'], ['healthcare', 'Healthcare'], ['sales_marketing', 'Sales & marketing'], ['engineering', 'Engineering'], ['customer_service', 'Customer service / reception'], ['other', 'Other']];
// What the publisher sees after submitting: live, or held for review with the reasons.
function jobOutcomeMessage(job, wasDraft) {
  if (wasDraft) return ['Job saved as draft.', 'success'];
  if (job?.outcome?.published || job?.status === 'active') return ['Job published. It is now live on CareerZ.', 'success'];
  const reasons = (job?.outcome?.flags || job?.moderation?.flags || []).map((f) => f.label).join('; ');
  return [`Job sent to admin review before it goes live${reasons ? `: ${reasons}` : ''}. You will be notified of the decision.`, 'success'];
}

const SALARY_CURRENCIES = ['PKR', 'USD', 'AED', 'SAR', 'GBP', 'EUR', 'QAR', 'OMR', 'KWD', 'CAD', 'AUD'];
const EMPTY_JOB_FORM = {
  title: '', company: '', type: 'full_time', workMode: 'onsite', country: '', city: '',
  salaryMin: '', salaryMax: '', experienceYears: '', education: '', skills: '', description: '',
  companyLogo: '', image: '', visaSponsorship: false, applicationDeadline: '', status: 'active', category: 'other', currency: 'PKR',
  vacancies: '1', genderPreference: 'any', ageMin: '', ageMax: '', interviewQuestions: ''
};

// Master 12.4 AI Job Builder: one line in, a full draft out (the employer's own AI provider).
// It only fills the form below; nothing is posted until the employer presses Post Job.
function AiJobBuilder({ form, setForm, onFlash }) {
  const [brief, setBrief] = useState(''), [busy, setBusy] = useState(false), [result, setResult] = useState(null);
  async function build() {
    setBusy(true);
    try {
      const d = await apiRequest('/jobs/ai/build-job', { method: 'POST', body: { brief, country: form.country, city: form.city, company: form.company } });
      setResult(d);
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        description: d.description || f.description,
        skills: d.skills?.length ? d.skills.join(', ') : f.skills,
        experienceYears: d.experienceYears ? String(d.experienceYears) : f.experienceYears,
        education: d.education || f.education,
        salaryMin: d.salarySuggestion?.min ? String(d.salarySuggestion.min) : f.salaryMin,
        salaryMax: d.salarySuggestion?.max ? String(d.salarySuggestion.max) : f.salaryMax,
        currency: d.salarySuggestion?.currency || f.currency,
        category: JOB_CATEGORIES.some(([v]) => v === d.category) ? d.category : f.category,
        interviewQuestions: d.interviewQuestions?.length ? d.interviewQuestions.join('\n') : f.interviewQuestions
      }));
      onFlash('Draft ready. Check every field below before you post.', 'success');
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="card ai-job-builder">
      <div><strong>AI Job Builder</strong><p>Write one line, for example "Need English Teacher for O-levels in Lahore". AI drafts the description, skills, interview questions, a salary suggestion and a market note using your own AI provider.</p></div>
      <div className="ai-job-builder-row">
        <input className="form-input" aria-label="Describe the job in one line" placeholder="Need English Teacher" value={brief} onChange={(e) => setBrief(e.target.value)} />
        <button type="button" className="btn btn-primary" disabled={busy || brief.trim().length < 4} onClick={build}>{busy ? 'Building…' : 'Build with AI'}</button>
      </div>
      {result && (
        <div className="ai-job-builder-result">
          {(result.salarySuggestion?.min || result.salarySuggestion?.max) && <p><strong>Salary suggestion:</strong> {result.salarySuggestion.currency} {Number(result.salarySuggestion.min || 0).toLocaleString()} – {Number(result.salarySuggestion.max || 0).toLocaleString()}{result.salarySuggestion.note ? ` · ${result.salarySuggestion.note}` : ''}</p>}
          {result.marketAnalysis && <p><strong>Market analysis:</strong> {result.marketAnalysis}</p>}
          <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>Based on {result.market?.count || 0} similar CareerZ job{result.market?.count === 1 ? '' : 's'} from the last 6 months.</p>
        </div>
      )}
    </div>
  );
}

// agreementId: an agent publishing for an institute under an active recruitment agreement.
function EmployerPostJobPanel({ onFlash, institution = null, onPosted, agreementId = null, asAgent = false, employer = null }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_JOB_FORM, ...(institution ? { company: institution.name, category: 'teaching', country: institution.country || '', city: institution.city || '' } : {}) }));

  async function submit(e) {
    e.preventDefault();
    try {
      const job = await apiRequest('/jobs', {
        method: 'POST',
        body: {
          ...form,
          ...(agreementId ? { agreement: agreementId } : institution ? { institution: institution._id } : employer ? { employer } : {}),
          country: form.country.toUpperCase(),
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          applicationDeadline: form.applicationDeadline || undefined,
          vacancies: form.vacancies ? Number(form.vacancies) : 1,
          ageMin: form.ageMin ? Number(form.ageMin) : null,
          ageMax: form.ageMax ? Number(form.ageMax) : null,
          interviewQuestions: String(form.interviewQuestions || '').split('\n').map((q) => q.trim()).filter(Boolean)
        }
      });
      onFlash(...jobOutcomeMessage(job, form.status === 'draft'));
      setForm({ ...EMPTY_JOB_FORM, ...(institution ? { company: institution.name, category: 'teaching', country: institution.country || '', city: institution.city || '' } : {}) });
      onPosted?.();
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <form className="hiring-post-form" onSubmit={submit} style={{ display: 'grid', gap: 20, maxWidth: 720 }}>
      <AiJobBuilder form={form} setForm={setForm} onFlash={onFlash} />
      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Basic Information</p>
<label className="hiring-field"><span>Job title</span><input className="form-input" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        {institution
          ? <p className="text-sm" style={{ margin: 0 }}>{agreementId ? <>Posting for <strong>{institution.name}</strong> under your recruitment agreement. The job shows the institute's name; you manage its applicants.</> : <>Posting as <strong>{institution.name}</strong>. The job shows your institute's name and logo.</>}</p>
          : <div className="flex flex-wrap" style={{ gap: 14 }}>
<label className="hiring-field"><span>Company name</span><input className="form-input" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required style={{ flex: '1 1 220px', minWidth: 0 }} /></label>
<label className="hiring-field"><span>Company logo URL (optional)</span><input className="form-input" placeholder="Company logo URL (optional)" value={form.companyLogo} onChange={(e) => setForm({ ...form, companyLogo: e.target.value })} style={{ flex: '1 1 220px', minWidth: 0 }} /></label>
        </div>}
        <div className="hiring-field" style={{ minWidth: 0 }}><span>Category</span>
          <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Job category" minWidth="100%" options={JOB_CATEGORIES.map(([value, label]) => ({ value, label }))} />
        </div>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <div className="hiring-field" style={{ flex: '1 1 200px', minWidth: 0 }}><span>Job type</span>
            <CustomSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} ariaLabel="Job type" minWidth="100%" options={JOB_TYPES.map((t) => ({ value: t, label: t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))} />
          </div>
          <div className="hiring-field" style={{ flex: '1 1 200px', minWidth: 0 }}><span>Work mode</span>
            <CustomSelect value={form.workMode} onChange={(v) => setForm({ ...form, workMode: v })} ariaLabel="Work mode" minWidth="100%" options={WORK_MODES.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Location & Compensation</p>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
<label className="hiring-field"><span>Country code (e.g. PK)</span><input className="form-input" placeholder="Country code (e.g. PK)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required style={{ flex: '1 1 160px', minWidth: 0 }} /></label>
<label className="hiring-field"><span>City</span><input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} /></label>
        </div>
        <div className="job-form-salary">
<label className="hiring-field"><span>Salary min</span><input className="form-input" type="number" placeholder="Salary min" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} /></label>
<label className="hiring-field"><span>Salary max</span><input className="form-input" type="number" placeholder="Salary max" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} /></label>
          <label className="hiring-field"><span>Currency</span><select className="form-select" aria-label="Salary currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{SALARY_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
<label className="hiring-field"><span>Years experience</span><input className="form-input" type="number" placeholder="Years experience" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} /></label>
        </div>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Requirements & Description</p>
<div className="job-form-extras">
<label className="hiring-field"><span>Number of vacancies</span><input className="form-input" type="number" min="1" max="1000" value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: e.target.value })} /></label>
<label className="hiring-field"><span>Gender (optional)</span><select className="form-select" value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}><option value="any">Any gender</option><option value="female">Female</option><option value="male">Male</option></select></label>
<label className="hiring-field"><span>Minimum age (optional)</span><input className="form-input" type="number" min="14" max="80" placeholder="—" value={form.ageMin} onChange={(e) => setForm({ ...form, ageMin: e.target.value })} /></label>
<label className="hiring-field"><span>Maximum age (optional)</span><input className="form-input" type="number" min="14" max="80" placeholder="—" value={form.ageMax} onChange={(e) => setForm({ ...form, ageMax: e.target.value })} /></label>
</div>
<p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>Set gender or age only where the law and the role genuinely require it.</p>
<label className="hiring-field"><span>Education required</span><input className="form-input" placeholder="Education required" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} /></label>
<label className="hiring-field"><span>Skills (comma separated)</span><input className="form-input" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
<JobImageField value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} alt={form.imageAlt || ''} onAltChange={(imageAlt) => setForm((f) => ({ ...f, imageAlt }))} name={[form.title, form.city].filter(Boolean).join(' ')} />
<JobDescriptionEditor value={form.description} onChange={(description) => setForm((f) => ({ ...f, description }))} />
        <ImproveDescriptionButton form={form} setForm={setForm} onFlash={onFlash} />
<label className="hiring-field"><span>Interview questions (one per line, only you see them)</span><textarea className="form-input" rows={4} placeholder="e.g. How would you teach tenses to a weak class?" value={form.interviewQuestions} onChange={(e) => setForm({ ...form, interviewQuestions: e.target.value })} /></label>
        {asAgent && !agreementId && !institution && <EmployerEmailField value={form.employerEmail || ''} onChange={(v) => setForm({ ...form, employerEmail: v })} />}
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Deadline & Visibility</p>
        <div className="job-form-deadline">
          <label className="hiring-field"><span>Application deadline (optional)</span><input className="form-input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} /></label>
          <label className="job-form-check"><input type="checkbox" checked={form.visaSponsorship} onChange={(e) => setForm({ ...form, visaSponsorship: e.target.checked })} /> Visa sponsorship available</label>
        </div>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <div className="hiring-field" style={{ flex: '1 1 220px', minWidth: 0 }}><span>When you submit</span>
            <CustomSelect
              value={form.status} onChange={(v) => setForm({ ...form, status: v })} ariaLabel="Job visibility" minWidth="100%"
              options={[{ value: 'active', label: 'Submit for publishing' }, { value: 'draft', label: 'Save as Draft' }]}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '11px 22px', height: 46 }}>{form.status === 'draft' ? 'Save Draft' : 'Post Job'}</button>
        </div>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>Every job is checked automatically when you publish it. Most jobs go live straight away; jobs that ask applicants for money, promise guaranteed visas or look like duplicates wait for an admin to review them.</p>
      </div>
    </form>
  );
}

const JOB_STATUS = {
  draft: { tag: 'pending', label: 'Draft' },
  pending_review: { tag: 'pending', label: 'Under review' },
  rejected: { tag: 'rejected', label: 'Not approved' },
  active: { tag: 'approved', label: 'Active' },
  paused: { tag: 'pending', label: 'Paused' },
  closed: { tag: 'rejected', label: 'Closed' },
  filled: { tag: 'approved', label: 'Filled' },
  removed_by_admin: { tag: 'rejected', label: 'Removed by CareerZ admin' }
};

// Recruiter-facing status wording (Employer/Agent's own candidate-management views) — kept
// separate from JOB_APP_STATUS, which is the job-seeker-facing wording for the same
// underlying JobApplication.status values.
const CANDIDATE_STATUS = {
  pending: { tag: 'pending', label: 'Applied' },
  viewed: { tag: 'pending', label: 'Screening' },
  shortlisted: { tag: 'pending', label: 'Shortlisted' },
  interview: { tag: 'pending', label: 'Interview' },
  final_interview: { tag: 'pending', label: 'Final interview' },
  selected: { tag: 'pending', label: 'Offer' },
  accepted: { tag: 'approved', label: 'Offer accepted' },
  hired: { tag: 'approved', label: 'Joined' },
  completed: { tag: 'approved', label: 'Completed' },
  rejected: { tag: 'rejected', label: 'Not selected' },
  withdrawn: { tag: 'rejected', label: 'Withdrawn' }
};


// After an interview: mark it done with a result, then take the next hiring step from it.
const INTERVIEW_RESULT = { passed: 'Passed', not_passed: 'Not passed', no_show: 'Candidate did not come' };
function InterviewOutcome({ application: a, onFlash, onChanged, onScheduleFinal, onScheduleAgain }) {
  const [open, setOpen] = useState(false), [result, setResult] = useState('passed'), [notes, setNotes] = useState(''), [busy, setBusy] = useState(false);
  const next = a.nextInterview, last = a.lastInterview;
  async function save() {
    setBusy(true);
    try { await apiRequest(`/jobs/interviews/${next._id}`, { method: 'PATCH', body: { result, feedback: notes } }); onFlash('Interview marked done. Choose the next step.', 'success'); setOpen(false); onChanged(); }
    catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function cancel() {
    if (!(await showConfirm('Cancel this interview? The candidate keeps their application.', { title: 'Cancel interview', confirmLabel: 'Cancel interview', danger: true }))) return;
    try { await apiRequest(`/jobs/interviews/${next._id}`, { method: 'PATCH', body: { status: 'cancelled' } }); onFlash('Interview cancelled.', 'success'); onChanged(); } catch (err) { onFlash(err.message); }
  }
  async function move(status, text) {
    setBusy(true);
    try { await apiRequest(`/jobs/applications/${a._id}/status`, { method: 'PATCH', body: { status } }); onFlash(text, 'success'); onChanged(); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  if (next) {
    return (
      <div className="interview-outcome">
        {!open ? (
          <div className="interview-outcome-actions">
            <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Interview done</button>
            <button type="button" className="btn staff-remove" onClick={cancel}>Cancel interview</button>
          </div>
        ) : (
          <div className="interview-outcome-form">
            <label className="hiring-field"><span>Result</span><select className="form-select" value={result} onChange={(e) => setResult(e.target.value)}>{Object.entries(INTERVIEW_RESULT).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            <label className="hiring-field"><span>Your notes (only you see them)</span><input className="form-input" placeholder="How did it go?" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
            <div className="interview-outcome-actions"><button type="button" className="btn btn-primary" disabled={busy} onClick={save}>Save result</button><button type="button" className="btn" onClick={() => setOpen(false)}>Back</button></div>
          </div>
        )}
      </div>
    );
  }
  // Waiting for the employer's decision after a finished interview.
  if (!last || !['interview', 'final_interview'].includes(a.status)) return null;
  const passed = last.result === 'passed';
  return (
    <div className={`interview-outcome done ${passed ? 'good' : 'bad'}`}>
      <p><strong>{last.round === 'final_interview' ? 'Final interview' : 'Interview'} done:</strong> {INTERVIEW_RESULT[last.result] || 'Completed'}{last.feedback ? ` · ${last.feedback}` : ''}</p>
      <p className="interview-outcome-hint">Next step:</p>
      <div className="interview-outcome-actions">
        {passed && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => move('selected', 'Candidate selected. Send the offer from the status box.')}>Select and make offer</button>}
        {passed && last.round !== 'final_interview' && <button type="button" className="btn" onClick={onScheduleFinal}>Schedule final interview</button>}
        {!passed && <button type="button" className="btn" onClick={onScheduleAgain}>Schedule again</button>}
        <button type="button" className="btn staff-remove" disabled={busy} onClick={() => move('rejected', 'Candidate rejected. They have been told.')}>Reject</button>
      </div>
    </div>
  );
}

// One job in My Jobs: [title, company, location, type, posted, deadline, applicants, status, actions].
function MyJobCard({ cells }) {
  const [title, company, place, type, posted, deadline, applicants, status, actions] = cells;
  return (
    <div className="card my-job-card">
      <div className="my-job-card-top"><div className="my-job-card-title">{title}<small>{company}{place ? ` · ${place}` : ''}</small></div><div className="my-job-card-status">{status}</div></div>
      <dl className="my-job-card-facts">
        <div><dt>Type</dt><dd>{type}</dd></div><div><dt>Posted</dt><dd>{posted}</dd></div>
        <div><dt>Deadline</dt><dd>{deadline}</dd></div><div><dt>Applicants</dt><dd>{applicants}</dd></div>
      </dl>
      <div className="my-job-card-actions">{actions}</div>
    </div>
  );
}

function EmployerJobsPanel({ onFlash, institution = null, reloadKey = 0, employer = null }) {
  const [jazzCashEnabled, setJazzCashEnabled] = useState(false);
  const [safepayEnabled, setSafepayEnabled] = useState(false);
  useEffect(() => { getJazzCashConfig().then((config) => setJazzCashEnabled(Boolean(config.enabled))); getSafepayConfig().then((config) => setSafepayEnabled(Boolean(config.enabled))); }, []);
  const [jobs, setJobs] = useState([]);
  const [openJob, setOpenJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [interviewFormFor, setInterviewFormFor] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ scheduledDate: '', mode: 'online', location: '', provider: 'careerz', externalUrl: '' });
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  function load() {
    apiRequest(institution ? `/jobs/mine/list?institution=${institution._id}` : employer ? `/jobs/mine/list?employer=${employer}` : '/jobs/mine/list').then(setJobs).catch((err) => onFlash(err.message));
  }
  useEffect(load, [institution?._id, reloadKey, employer]); // eslint-disable-line react-hooks/exhaustive-deps

  function viewApplicants(jobId) {
    setOpenJob(jobId);
    apiRequest(`/jobs/${jobId}/applicants`).then(setApplicants).catch((err) => onFlash(err.message));
  }

  async function setJobStatus(job, status) {
    try {
      const updated = await apiRequest(`/jobs/${job._id}`, { method: 'PATCH', body: { status } });
      if (status === 'active' && !['active', 'paused'].includes(job.status)) onFlash(...jobOutcomeMessage(updated, false));
      else onFlash(`Job set to ${JOB_STATUS[status].label}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  function startEdit(job) {
    setEditingJobId(job._id);
    setEditForm({
      title: job.title, company: job.company, city: job.city || '', country: job.country,
      type: job.type, workMode: job.workMode || 'onsite', salaryMin: job.salaryMin ?? '', salaryMax: job.salaryMax ?? '', currency: job.currency || 'PKR',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '', description: job.description || '', image: job.image || '', imageAlt: job.imageAlt || ''
    });
  }

  async function saveEdit(jobId) {
    try {
      const updated = await apiRequest(`/jobs/${jobId}`, { method: 'PATCH', body: { ...editForm, applicationDeadline: editForm.applicationDeadline || null } });
      if (updated?.status === 'pending_review') onFlash(...jobOutcomeMessage(updated, false)); else onFlash('Job updated.', 'success');
      setEditingJobId(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function setAppStatus(appId, status) {
    try {
      await apiRequest(`/jobs/applications/${appId}/status`, { method: 'PATCH', body: { status } });
      onFlash(`Applicant ${status}.`, 'success');
      viewApplicants(openJob);
    } catch (err) { onFlash(err.message); }
  }

  async function submitInterview(appId) {
    if (!interviewForm.scheduledDate) return onFlash('Pick a date/time first.');
    try {
      await apiRequest(`/jobs/applications/${appId}/schedule-interview`, { method: 'POST', body: interviewForm });
      onFlash('Interview scheduled.', 'success');
      setInterviewFormFor(null);
      setInterviewForm({ scheduledDate: '', mode: 'online', location: '', provider: 'careerz', externalUrl: '', round: 'interview' });
      viewApplicants(openJob);
    } catch (err) { onFlash(err.message); }
  }

  const [featuredFee, setFeaturedFee] = useState(null);
  useEffect(() => { apiRequest('/jobs/featured-fee').then(setFeaturedFee).catch(() => {}); }, []);
  async function feature(jobId, gateway) {
    try { await (gateway === 'safepay' ? startSafepayCheckout : startJazzCashCheckout)(`/payments/jazzcash/jobs/${jobId}/feature-checkout`); } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="hiring-jobs-list">
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Jobs</h3>
      {jobs.length === 0 ? <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{institution ? 'No jobs posted for this institute yet.' : "You haven't posted any jobs yet."}</p> : <div className="my-job-cards">{jobs.map((j) => <MyJobCard key={j._id} cells={[
          <span>{j.title}{j.featured && new Date(j.featuredUntil) > new Date() && <span style={{ marginLeft: 6 }}><Tag status="approved" label="Featured" /></span>}</span>,
          j.company, [j.city, j.country].filter(Boolean).join(', '), j.type.replace('_', ' '),
          new Date(j.createdAt).toLocaleDateString(),
          j.applicationDeadline ? new Date(j.applicationDeadline).toLocaleDateString() : '—',
          j.applicantCount ?? 0,
          <div style={{ display: 'grid', gap: 4 }}>
            <><Tag status={JOB_STATUS[j.status]?.tag || 'pending'} label={JOB_STATUS[j.status]?.label || j.status} /> <EmployerConsentBadge job={j} /></>
            {j.status === 'pending_review' && <small style={{ color: 'var(--ink-soft)' }}>{(j.moderation?.flags || []).map((f) => f.label).join('; ') || 'Waiting for an admin.'}</small>}
            {j.status === 'rejected' && <small style={{ color: 'var(--rose, #b42318)' }}>{j.moderation?.note || 'Not approved.'} Edit and submit again.</small>}
            <AdminRemovedNote item={j} />
          </div>,
          <div className="flex hiring-row-actions" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setViewingJob(j)}>View</button>
            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => startEdit(j)}>Edit</button>
            {!institution && <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => downloadApplicantsCsv(j._id, onFlash)}>Download applicants (CSV)</button>}
            {featuredFee?.enabled !== false && !(j.featured && new Date(j.featuredUntil) > new Date()) && (
              <span className="flex gap-2 flex-wrap">
                {featuredFee && ['active', 'paused'].includes(j.status) && <ManualPayButton kind="featured_job" id={j._id} label={`Feature for ${featuredFee.days} days (USD ${featuredFee.fee}) · bank transfer`} onFlash={onFlash} onDone={load} />}
                {safepayEnabled && featuredFee && ['active', 'paused'].includes(j.status) && <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => feature(j._id, 'safepay')}>Feature for {featuredFee.days} days (USD {featuredFee.fee}) · Safepay</button>}
                {jazzCashEnabled && featuredFee && ['active', 'paused'].includes(j.status) && <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => feature(j._id)}>Feature for {featuredFee.days} days (USD {featuredFee.fee}) · JazzCash</button>}
              </span>
            )}
            {['draft', 'rejected'].includes(j.status) && <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setJobStatus(j, 'active')}>{j.status === 'draft' ? 'Submit' : 'Submit again'}</button>}
            {(j.status === 'active' || j.status === 'paused') && (
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setJobStatus(j, j.status === 'active' ? 'paused' : 'active')}>{j.status === 'active' ? 'Pause' : 'Resume'}</button>
            )}
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => viewApplicants(j._id)}>Manage Candidates</button>
          </div>
        ]} />)}</div>}
      <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} />
      {editingJobId && editForm && (
        <div className="card" style={{ padding: 20, marginTop: 20, maxWidth: 560 }}>
          <strong className="text-sm">Edit Job</strong>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            <input className="form-input" placeholder="Job title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <input className="form-input" placeholder="Company" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
            <div className="flex flex-wrap" style={{ gap: 12 }}>
              <input className="form-input" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
              <input className="form-input" placeholder="Country code" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
            </div>
            <div className="flex flex-wrap" style={{ gap: 12 }}>
              <input className="form-input" type="number" placeholder="Salary min" value={editForm.salaryMin} onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value ? Number(e.target.value) : '' })} style={{ flex: '1 1 150px', minWidth: 0 }} />
              <input className="form-input" type="number" placeholder="Salary max" value={editForm.salaryMax} onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value ? Number(e.target.value) : '' })} style={{ flex: '1 1 150px', minWidth: 0 }} />
              <select className="form-select" aria-label="Salary currency" value={editForm.currency} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} style={{ flex: '0 1 110px', minWidth: 0 }}>{[...new Set([editForm.currency, ...SALARY_CURRENCIES])].map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Application deadline
              <input className="form-input" type="date" value={editForm.applicationDeadline} onChange={(e) => setEditForm({ ...editForm, applicationDeadline: e.target.value })} style={{ marginTop: 6, maxWidth: 220 }} />
            </label>
            <JobImageField value={editForm.image} onChange={(image) => setEditForm((f) => ({ ...f, image }))} alt={editForm.imageAlt || ''} onAltChange={(imageAlt) => setEditForm((f) => ({ ...f, imageAlt }))} name={[editForm.title, editForm.city].filter(Boolean).join(' ')} />
            <JobDescriptionEditor value={editForm.description} onChange={(description) => setEditForm((f) => ({ ...f, description }))} />
            <div className="flex" style={{ gap: 10 }}>
              <button type="button" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem' }} onClick={() => saveEdit(editingJobId)}>Save Changes</button>
              <button type="button" className="btn" style={{ padding: '7px 16px', fontSize: '0.78rem' }} onClick={() => setEditingJobId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {openJob && (
        <div style={{ marginTop: 32 }}>
          <h3 className="font-semibold" style={{ marginBottom: 14 }}>Manage Candidates</h3>
          {applicants.length > 1 && <RankApplicantsButton jobId={openJob._id || openJob} onFlash={onFlash} />}
          {applicants.length === 0 && (
            <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
              <FaUsers aria-hidden="true" />
              <p>No applicants yet</p>
            </div>
          )}
          <GuestApplicants key={openJob} jobId={openJob} onFlash={onFlash} />
          <div style={{ display: 'grid', gap: 12 }}>
            {applicants.map((a) => (
              <div key={a._id} className="card" style={{ padding: 18 }}>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
                  <div className="flex items-start" style={{ gap: 12 }}>
                    {a.applicant?.profilePhoto
                      ? <img src={a.applicant.profilePhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{(a.applicant?.fullName || '?')[0]}</div>}
                    <div>
                      <strong className="text-sm">{a.applicant?.fullName}</strong>{a.referredBy && <span className="referred-badge">Referred by {a.referredBy}</span>}
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{a.applicant?.email}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{a.resumeSnapshot?.skills?.length > 0 ? a.resumeSnapshot.skills.join(', ') : 'No skills listed'} · {a.resumeSnapshot?.experienceLevel || 'Experience not set'} · {a.resumeSnapshot?.location || 'Location not set'}</p>
                      <p className="text-xs" style={{ marginTop: 4 }}><CvDownload application={a} onFlash={onFlash} /> · Applied {new Date(a.createdAt).toLocaleDateString()}</p>
                      <div style={{ marginTop: 6 }}><ApplicantContact application={a} /></div>
                      <div style={{ marginTop: 6 }}><ApplicationThread applicationId={a._id} count={a.messageCount} onFlash={onFlash} /></div>
                      {a.nextInterview && <div className="text-xs" style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span><strong>{a.nextInterview.round === 'final_interview' ? 'Final interview' : 'Interview'}:</strong> {new Date(a.nextInterview.scheduledDate).toLocaleString()} · {a.nextInterview.mode !== 'online' ? a.nextInterview.location : (MEETING_PROVIDERS.find(([v]) => v === (a.nextInterview.provider || 'careerz'))?.[1] || 'CareerZ video room')}</span><InterviewJoin interview={{ ...a.nextInterview, job: jobs.find((j) => j._id === openJob) }} /></div>}
                      <InterviewOutcome application={a} onFlash={onFlash} onChanged={() => viewApplicants(openJob)} onScheduleFinal={() => { setInterviewForm((f) => ({ ...f, round: 'final_interview' })); setInterviewFormFor(a._id); }} onScheduleAgain={() => { setInterviewForm((f) => ({ ...f, round: a.lastInterview?.round || 'interview' })); setInterviewFormFor(a._id); }} />
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 10, flexShrink: 0 }}>
                    <HiringStatusControl key={`${a._id}-${a.status}-${a.employment?.status || ''}-${a.employment?.offerLetter?.sentAt || ''}`} application={a} job={jobs.find((j) => j._id === openJob)} institutionConfirms={Boolean(jobs.find((j) => j._id === openJob)?.agreement)} onFlash={onFlash} onSaved={() => viewApplicants(openJob)} />
                    <button type="button" className="btn" style={{ padding: '8px 14px', fontSize: '0.75rem' }} onClick={() => { setInterviewForm((f) => ({ ...f, round: 'interview' })); setInterviewFormFor(interviewFormFor === a._id ? null : a._id); }}>Schedule Interview</button>
                    <StartVisaCase application={a} job={jobs.find((j) => j._id === openJob)} onFlash={onFlash} />
                  </div>
                </div>
                {a.status === 'hired' && jobs.find((j) => j._id === openJob)?.type === 'internship' && (
                  <div style={{ borderTop: '1px solid var(--sand-line)', paddingTop: 12, marginTop: 12 }}><IssueInternshipCertificate applicationId={a._id} onFlash={onFlash} /></div>
                )}
                {interviewFormFor === a._id && (
                  <div className="flex items-end flex-wrap" style={{ gap: 12, borderTop: '1px solid var(--sand-line)', paddingTop: 14, marginTop: 14 }}>
                    {interviewForm.round === 'final_interview' && <strong className="text-sm" style={{ width: '100%' }}>Final interview</strong>}
                    <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Date/Time
                      <input type="datetime-local" className="form-input" value={interviewForm.scheduledDate} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })} style={{ marginTop: 6 }} />
                    </label>
                    <div style={{ minWidth: 140 }}>
                      <CustomSelect
                        value={interviewForm.mode} onChange={(v) => setInterviewForm({ ...interviewForm, mode: v })} ariaLabel="Interview mode" minWidth="100%"
                        options={[{ value: 'online', label: 'Online' }, { value: 'physical', label: 'Physical' }]}
                      />
                    </div>
                    {interviewForm.mode === 'online' && <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 180px', minWidth: 0 }}>Meeting service<select className="form-select" value={interviewForm.provider} onChange={(e) => setInterviewForm({ ...interviewForm, provider: e.target.value })} style={{ marginTop: 6 }}>{MEETING_PROVIDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>}
                    {interviewForm.mode === 'online' && interviewForm.provider !== 'careerz' && <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '2 1 240px', minWidth: 0 }}>Meeting link<input className="form-input" type="url" placeholder="https://…" value={interviewForm.externalUrl} onChange={(e) => setInterviewForm({ ...interviewForm, externalUrl: e.target.value })} style={{ marginTop: 6 }} /></label>}
                    {interviewForm.mode === 'online'
                      ? (interviewForm.provider === 'careerz' ? <span className="text-xs" style={{ flex: '1 1 200px', minWidth: 0, color: 'var(--ink-soft)' }}>Held in CareerZ's own video room; you and the candidate get a Join button.</span> : null)
                      : <input className="form-input" placeholder="Location / address" value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />}
                    <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => submitInterview(a._id)}>Confirm</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Donor



const RECEIVED_KINDS = ['donation', 'sponsorship_payment'];
function ReceivedDonationsPanel({ onFlash }) {
  const [donations, setDonations] = useState(null);
  const [sponsorships, setSponsorships] = useState(null);
  const [transfers, setTransfers] = useState([]);
  function load() {
    apiRequest('/funding-requests/mine/received-donations').then(setDonations).catch((err) => onFlash(err.message));
    apiRequest('/manual-payments/incoming').then((list) => setTransfers(list.filter((m) => RECEIVED_KINDS.includes(m.kind)))).catch(() => setTransfers([]));
    apiRequest('/scholarships/received/sponsorship-payments').then(setSponsorships).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(donation, decision) {
    let rejectionReason = '';
    if (decision === 'reject') {
      rejectionReason = await showPrompt('Why was this payment rejected?', { title: 'Reject donation payment', required: true });
      if (!rejectionReason) return;
    } else {
      const confirmed = await showConfirm('Confirm only after this money has actually reached you.', { confirmLabel: 'Money received' });
      if (!confirmed) return;
    }
    try {
      await apiRequest(`/funding-requests/donations/${donation._id}/verify-payment`, { method: 'PATCH', body: { decision, rejectionReason } });
      onFlash(decision === 'verify' ? 'Donation received and verified.' : 'Donation payment rejected.', 'success'); load();
    } catch (err) { onFlash(err.message); }
  }
  async function decideSponsorship(sponsorship, payment, decision) {
    let rejectionReason = '';
    if (decision === 'reject') { rejectionReason = await showPrompt('Why was this payment rejected?', { title: 'Reject sponsorship payment', required: true }); if (!rejectionReason) return; }
    else { const confirmed = await showConfirm('Confirm only after this money has actually reached you.', { confirmLabel: 'Money received' }); if (!confirmed) return; }
    try { await apiRequest(`/scholarships/received/sponsorships/${sponsorship._id}/payments/${payment._id}`, { method: 'PATCH', body: { decision, rejectionReason } }); onFlash(`Sponsorship payment ${decision === 'verify' ? 'verified' : 'rejected'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  // Bank-transfer donations: the receiver says whether the money arrived; CareerZ then approves.
  async function answerTransfer(m, received) {
    let note = '';
    if (received) { if (!await showConfirm('Confirm only after this money has actually reached you.', { confirmLabel: 'Money received' })) return; }
    else { note = await showPrompt('What did you find? (CareerZ will call both sides)', { title: 'Money not received', required: true }); if (!note) return; }
    try { await apiRequest(`/manual-payments/${m._id}/confirm`, { method: 'PATCH', body: { received, note } }); onFlash('Thank you. CareerZ was told.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  const transferStatus = (m) => m.status === 'approved' ? ['approved', 'received']
    : m.status === 'rejected' ? ['rejected', 'rejected']
    : m.recipientConfirmation?.received == null ? ['pending', 'confirm it arrived']
    : m.recipientConfirmation.received ? ['pending', 'CareerZ is checking'] : ['rejected', 'you said not received'];
  if (donations === null || sponsorships === null) return <p className="admin-notice">Loading...</p>;
  return <div className="institution-ui institution-donations-ui"><h3 className="font-semibold mb-2">Received Donations</h3><p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>A reported payment is counted only after you verify that the money reached you.</p>
    <Table headers={['Donor', 'Request', 'Amount', 'Method / Reference', 'Proof', 'Status', 'Action']} rows={[...transfers.map((m) => [
      m.payerSnapshot?.name || 'Donor', String(m.title || '').replace(/^Donation:\s*/, ''), `${m.currency} ${Number(m.sellerAmount || 0).toLocaleString()}`, `Bank transfer · ${m.sellerLeg?.transactionId || '—'}`,
      <button type="button" className="btn" onClick={() => openPrivateFile(`/manual-payments/${m._id}/proof/seller`).catch((err) => onFlash(err.message))}>View receipt</button>,
      <Tag status={transferStatus(m)[0]} label={transferStatus(m)[1]} />,
      m.status === 'submitted' && m.recipientConfirmation?.received == null ? <div className="flex gap-2"><button className="btn btn-primary" onClick={() => answerTransfer(m, true)}>Money received</button><button className="btn" onClick={() => answerTransfer(m, false)}>Not received</button></div> : '—'
    ]), ...donations.map((d) => [
      d.donor?.fullName || 'Donor', d.fundingRequest?.title || '—', `${d.currency} ${d.amount}`, `${d.paymentMethod} · ${d.paymentReference || '—'}`,
      d.paymentProofUrl ? <a className="btn" href={d.paymentProofUrl} target="_blank" rel="noreferrer">View proof</a> : '—',
      <Tag status={d.status === 'successful' ? 'approved' : d.status === 'rejected' || d.status === 'failed' ? 'rejected' : 'pending'} label={d.status} />,
      d.status === 'pending' ? <div className="flex gap-2"><button className="btn btn-primary" onClick={() => decide(d, 'verify')}>Confirm received</button><button className="btn" onClick={() => decide(d, 'reject')}>Reject</button></div> : '—'
    ])]} empty="No received donation payments." />
    {/* Other bank transfers sent to this account (fees, orders...); donations are in the table above. */}
    <IncomingManualPayments onFlash={onFlash} exclude={RECEIVED_KINDS} />
    <ReceivingAccount onFlash={onFlash} /></div>;
}




























// ----------------------------------------------------------- Marketplace Seller



// ------------------------------------------------------------------ Agent















// ----------------------------------------------------------------- Admin



















function resizeImageToCanvas(file, maxDimension) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Resizes in the browser either way (a phone photo can be several MB), then — if platform cloud
// storage is configured (Super Admin sets CLOUDINARY_CLOUD_NAME etc.) — uploads it for a real
// https URL. Falls back to a base64 data URI stored directly on the document when storage isn't
// configured yet, so this never breaks a deployment that hasn't set that up.
async function resizeImageToDataUrl(file, maxDimension = 320, quality = 0.72, folder = 'uploads') {
  const canvas = await resizeImageToCanvas(file, maxDimension);
  const available = await isPlatformUploadAvailable();
  if (!available) return canvas.toDataURL('image/jpeg', quality);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  return uploadToPlatformStorage(blob, folder);
}

function ProfilePanel({ user, onFlash, onChanged }) {
  const { logout } = useAuth();
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  async function resend() {
    try { await resendVerification(); setSent(true); onFlash('Verification code sent. Check the backend console (SMTP is not configured yet).', 'success'); } catch (err) { onFlash(err.message); }
  }
  async function verify(e) {
    e.preventDefault();
    try { await verifyEmail(code); onFlash('Email verified!', 'success'); setCode(''); onChanged?.(); } catch (err) { onFlash(err.message); }
  }

  function startEdit() {
    setForm({ fullName: user.fullName || '', phone: user.phone || '', profilePhoto: user.profilePhoto || '' });
    setEditing(true);
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return onFlash('Please choose an image file.');
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320, 0.72, 'profiles');
      setForm((f) => ({ ...f, profilePhoto: dataUrl }));
    } catch (err) { onFlash(err.message); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: form });
      onFlash('Profile updated.', 'success');
      setEditing(false);
      onChanged?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  async function deleteAccount(e) {
    e.preventDefault();
    if (!deletePassword) return onFlash('Enter your password to confirm.');
    setDeleting(true);
    try {
      await apiRequest('/users/me', { method: 'DELETE', body: { currentPassword: deletePassword } });
      await logout();
    } catch (err) { onFlash(err.message); setDeleting(false); }
  }

  if (!user) return null;
  return (
    <div className="institution-ui institution-remaining-ui institution-account-profile-ui card" style={{ padding: 22, marginBottom: 20 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h3 className="font-semibold">Personal Information</h3>
        {!editing && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={startEdit}>Edit Profile</button>}
      </div>

      {!editing ? (
        <div className="flex items-center" style={{ gap: 16 }}>
          {user.profilePhoto
            ? <img src={user.profilePhoto} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>{(user.fullName || '?')[0]}</div>}
          <div className="account-profile-details">
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email} {user.emailVerified ? <Tag status="approved" /> : <Tag status="pending" />}</p>
            <p><strong>Phone:</strong> {user.phone || '—'}</p>
            <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
            <p><strong>Status:</strong> {user.status}</p>
            <p className="flex items-center" style={{ gap: 8 }}>
              <strong>User ID:</strong>
              <code style={{ fontSize: '0.78rem', background: 'var(--sand)', padding: '2px 8px', borderRadius: 6 }}>{user._id}</code>
              <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.72rem' }} onClick={() => navigator.clipboard?.writeText(user._id)}>Copy</button>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={saveProfile} style={{ display: 'grid', gap: 14, maxWidth: 420 }}>
          <div className="flex items-center" style={{ gap: 16 }}>
            {form.profilePhoto
              ? <img src={form.profilePhoto} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>{(form.fullName || '?')[0]}</div>}
            <label className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer' }}>
              Choose Photo
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
            {form.profilePhoto && (
              <button type="button" className="btn" title="Remove selected photo" style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#b42318', borderColor: '#e5b4b4' }} onClick={() => setForm((f) => ({ ...f, profilePhoto: '' }))}>
                <FaXmark aria-hidden="true" />
              </button>
            )}
          </div>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Full Name
            <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={{ marginTop: 6 }} required />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Phone
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ marginTop: 6 }} />
          </label>
          <div className="flex" style={{ gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem' }} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      {!user.emailVerified && (
        <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: 'var(--sand)' }}>
          <div className="flex items-start" style={{ gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FaShieldHalved aria-hidden="true" size={16} />
            </span>
            <div>
              <strong className="text-sm">Verify your email</strong>
            </div>
          </div>

          <button type="button" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', marginTop: 16 }} onClick={resend}>
            {sent ? 'Resend code' : 'Send verification code'}
          </button>

          <form onSubmit={verify} className="flex items-end flex-wrap" style={{ gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
            <input className="form-input" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} style={{ maxWidth: 180, minWidth: 0, background: 'var(--paper-raised)' }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', flexShrink: 0 }}>Verify</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: 'var(--paper-raised)', border: '1px solid #e5b4b4' }}>
        <strong className="text-sm" style={{ color: '#b42318' }}>Delete Account</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          This permanently deactivates your CareerZ account and signs you out everywhere. This cannot be undone from the app.
        </p>

        {!confirmingDelete ? (
          <button type="button" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem', marginTop: 12, color: '#b42318', borderColor: '#e5b4b4' }} onClick={() => setConfirmingDelete(true)}>
            Delete My Account
          </button>
        ) : (
          <form onSubmit={deleteAccount} style={{ display: 'grid', gap: 10, marginTop: 12, maxWidth: 320 }}>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Confirm your password
              <input type="password" className="form-input" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ marginTop: 6 }} required autoFocus />
            </label>
            <div className="flex" style={{ gap: 10 }}>
              <button type="submit" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem', background: '#b42318', color: '#fff', borderColor: '#b42318' }} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button type="button" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => { setConfirmingDelete(false); setDeletePassword(''); }} disabled={deleting}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function RolesPanel({ onFlash, onChanged }) {
  const [requests, setRequests] = useState([]);
  const [role, setRole] = useState('teacher');
  const roleOptions = ['parent', 'teacher', 'institution_owner', 'institution_staff', 'employer', 'education_agent', 'donor', 'academy_owner', 'marketplace_seller'];

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  async function load() {
    setLoading(true); setLoadError('');
    try { setRequests(await apiRequest('/roles/my-requests')); } catch (err) { setLoadError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/roles/request', { method: 'POST', body: { requestedRole: role } });
      onFlash('Role request submitted.', 'success');
      load();
      onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="institution-ui institution-remaining-ui institution-roles-ui admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>My Roles</h2><p>Request access to another workspace.</p></div><FaUserShield aria-hidden="true" /></div>
      {loading && <p role="status" className="admin-notice">Loading your records...</p>}
      {loadError && <div role="alert" className="admin-notice error">{loadError} <button type="button" onClick={load}>Retry</button></div>}
      <form onSubmit={submit} className="flex items-end flex-wrap" style={{ gap: 12, marginBottom: 24 }}>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <CustomSelect
            value={role} onChange={setRole} ariaLabel="Role to request" minWidth="100%"
            options={roleOptions.map((r) => ({ value: r, label: r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Submit Request</button>
      </form>
      <h3 className="font-semibold mb-2">My Requests</h3>
      <Table loading={loading} error={loadError} onRetry={load} headers={['Role', 'Status', 'Requested']} rows={requests.map((r) => [r.requestedRole, <Tag status={r.status} />, new Date(r.createdAt).toLocaleDateString()])} empty="No requests yet." />
    </div>
  );
}

function ComplaintTargetPicker({ target, onPick, onClear }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      apiRequest(`/users/search?q=${encodeURIComponent(query.trim())}`).then((r) => { setResults(r); setOpen(true); }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (target) {
    return (
      <div className="form-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span>Against: <strong>{target.fullName}</strong> ({target.email})</span>
        <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.75rem' }} onClick={onClear}>Remove</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-input" placeholder="Search person by name or email (optional — who is this against?)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5, maxHeight: 220, overflowY: 'auto', background: 'var(--paper, #fff)', border: '1px solid var(--sand-line, #ddd)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: 4 }}>
          {results.map((u) => (
            <button
              type="button" key={u._id}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              onMouseDown={() => { onPick(u); setQuery(''); setResults([]); setOpen(false); }}
            >
              <div>{u.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{u.email} · {(u.roles || []).join(', ')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Generic "find a person by name/email instead of pasting their raw User ID" picker — same
// search-as-you-type pattern as ComplaintTargetPicker, reused anywhere a form needs a userId
// (e.g. adding institution staff) without forcing the owner to go dig up someone's account ID.
function PersonPicker({ selected, onPick, onClear, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      apiRequest(`/users/search?q=${encodeURIComponent(query.trim())}`).then((r) => { setResults(r); setOpen(true); }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className="form-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minWidth: 220 }}>
        <span><strong>{selected.fullName}</strong> <span style={{ color: 'var(--ink-soft)', fontSize: '0.78rem' }}>({selected.email})</span></span>
        <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.75rem' }} onClick={onClear}>Change</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minWidth: 220 }}>
      <input
        className="form-input" placeholder={placeholder || 'Search person by name or email'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5, maxHeight: 220, overflowY: 'auto', background: 'var(--paper, #fff)', border: '1px solid var(--sand-line, #ddd)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: 4 }}>
          {results.map((u) => (
            <button
              type="button" key={u._id}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              onMouseDown={() => { onPick(u); setQuery(''); setResults([]); setOpen(false); }}
            >
              <div>{u.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{u.email} · {(u.roles || []).join(', ')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportComplaintPanel({ onFlash }) {
  const [complaints, setComplaints] = useState(null);
  const [form, setForm] = useState({ subject: '', category: 'other', description: '' });
  const [target, setTarget] = useState(null);

  function load() { apiRequest('/complaints/mine').then(setComplaints).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    try {
      const body = { ...form, targetType: target ? 'user' : 'none', targetId: target?._id || null };
      await apiRequest('/complaints', { method: 'POST', body });
      onFlash('Complaint submitted. Our team will review it.', 'success');
      setForm({ subject: '', category: 'other', description: '' });
      setTarget(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="institution-ui institution-remaining-ui institution-support-ui admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Report a Problem</h2><p>File a complaint for the platform team to review.</p></div><FaShieldHalved aria-hidden="true" /></div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        <label className="institution-field"><span>Subject</span><input className="form-input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
        <CustomSelect
          value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Complaint category" minWidth="100%"
          options={['harassment', 'fraud', 'technical', 'billing', 'content', 'other'].map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
        />
        <ComplaintTargetPicker target={target} onPick={setTarget} onClear={() => setTarget(null)} />
        <label className="institution-field"><span>Describe the issue</span><textarea className="form-input" placeholder="Describe the issue" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '7px 18px' }}>Submit Complaint</button>
      </form>
      <Table
        loading={complaints === null}
        headers={['Subject', 'Against', 'Category', 'Status', 'Filed']}
        rows={(complaints || []).map((c) => [c.subject, c.target ? `${c.target.fullName} (${c.target.email})` : '—', c.category, <Tag status={c.status === 'resolved' ? 'approved' : c.status === 'dismissed' ? 'rejected' : 'pending'} />, new Date(c.createdAt).toLocaleDateString()])}
        empty="You haven't filed any complaints."
      />
    </div>
  );
}










// Real, relationship-verified teacher rating (spec: Student/Parent/Institution → Teacher
// feedback/reputation) — the backend only accepts a rating from someone with an actual
// class/child/institution link to the teacher, so this same widget is safe to drop into any
// screen that already shows a specific teacher (course view, staff list, ...).
function TeacherReputationWidget({ teacherId, onFlash }) {
  const [reputation, setReputation] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  function load() { apiRequest(`/teacher-feedback/${teacherId}`).then(setReputation).catch(() => {}); }
  useEffect(load, [teacherId]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/teacher-feedback/${teacherId}`, { method: 'POST', body: { rating, comment } });
      onFlash?.('Rating submitted.', 'success');
      setComment('');
      load();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  if (!teacherId) return null;
  return (
    <div className="card" style={{ padding: 14, marginTop: 12 }}>
      <strong className="text-xs">Teacher Rating</strong>
      {reputation && reputation.totalCount > 0
        ? <p className="text-sm flex items-center" style={{ margin: '4px 0', gap: 4 }}><FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {reputation.overallAverage} ({reputation.totalCount} rating{reputation.totalCount === 1 ? '' : 's'})</p>
        : <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0' }}>No ratings yet.</p>}
      <form onSubmit={submit} className="flex gap-2 items-end flex-wrap" style={{ marginTop: 8 }}>
        <select className="form-select" value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ maxWidth: 90 }}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
        </select>
        <input className="form-input" placeholder="Optional comment" value={comment} onChange={(e) => setComment(e.target.value)} style={{ minWidth: 180 }} />
        <button type="submit" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busy}>{busy ? 'Saving...' : 'Rate teacher'}</button>
      </form>
    </div>
  );
}


// PDF: "Course Resources — Central Download Area" (teacher side) — add notes, an external
// video link (we never host/stream video ourselves), and downloadable materials per lesson.
// Lets a teacher define how "course completed" is actually decided for this course — see
// backend/src/utils/courseProgress.js. Weights only need to sum to 100; a category with no items
// in this course (e.g. no assignments) is automatically excluded and its weight redistributed,
// so leaving assignments/tests at their default weight never blocks a course that never uses them.
// Invitations from an institute to the signed-in person's email, with Accept and Decline in the app.
function InstituteInviteBanner({ onFlash, onJoined }) {
  const [invites, setInvites] = useState([]);
  const [busy, setBusy] = useState(null);
  const load = () => apiRequest('/my-invitations').then(setInvites).catch(() => setInvites([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!invites.length) return null;
  async function respond(id, decision) {
    setBusy(id);
    try {
      await apiRequest(`/my-invitations/${id}/${decision}`, { method: 'POST' });
      onFlash(decision === 'accept' ? 'You joined the institute.' : 'Invitation declined.', 'success');
      load();
      if (decision === 'accept') await onJoined?.();
    } catch (err) { onFlash(err.message); } finally { setBusy(null); }
  }
  return (
    <div className="company-invites">
      {invites.map((i) => (
        <div key={i._id} className="card company-invite">
          <div>
            <strong>{i.institution?.name || 'An institute'} invited you to join as {i.kind === 'staff' ? i.role : i.kind}{i.designation ? ` (${i.designation})` : ''}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>{[i.department, i.classSection && `Class ${i.classSection}`, i.message && `"${i.message}"`].filter(Boolean).join(' · ') || `Valid until ${new Date(i.expiresAt).toLocaleDateString()}`}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" disabled={busy === i._id} onClick={() => respond(i._id, 'accept')}>Accept</button>
            <button type="button" className="btn" disabled={busy === i._id} onClick={() => respond(i._id, 'decline')}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}







function ParentPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('guardian');
  async function load() { try { setChildren(await apiRequest('/parents/children')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function link(e) {
    e.preventDefault();
    try { await apiRequest('/parents/link-requests', { method: 'POST', body: { studentEmail: email, relationship } }); onFlash('Link request sent. The student must approve it.', 'success'); setEmail(''); } catch (err) { onFlash(err.message); }
  }

  async function unlink(id) {
    try { await apiRequest(`/parents/link-requests/${id}`, { method: 'DELETE' }); onFlash('Connection removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Link a Child</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Enter your child's account email — they'll need to approve the request from their own account before you can see their data.</p>
      <form onSubmit={link} className="card" style={{ padding: 20, marginBottom: 28 }}>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <label style={{ flex: '2 1 240px', minWidth: 0 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Student's email</span>
            <input className="form-input" type="email" placeholder="e.g. child@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ flex: '1 1 160px', minWidth: 0 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Relationship</span>
            <select className="form-select" value={relationship} onChange={(e) => setRelationship(e.target.value)} style={{ textTransform: 'capitalize' }}>
              {['father', 'mother', 'guardian', 'sponsor'].map((r) => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '11px 20px', height: 46 }}>Send Link Request</button>
        </div>
      </form>
      <h3 className="font-semibold mb-2">My Children</h3>
      <Table
        headers={['Name', 'Email', 'Relationship', 'Access', 'Action']}
        rows={children.map((c) => [
          c.student.fullName, c.student.email,
          <span style={{ textTransform: 'capitalize' }}>{c.relationship}</span>,
          c.relationship === 'sponsor'
            ? <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>View progress &amp; pay fees only</span>
            : <span className="text-xs" style={{ color: 'var(--forest)' }}>Full guardian access</span>,
          <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem', background: 'var(--sand-line)' }} onClick={() => unlink(c._id)}>Unlink</button>
        ])}
        empty="No approved children yet."
      />
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>
        Father / Mother / Guardian links get full access, including Health Record and signing permission slips. A Sponsor link can view academic progress and pay fees, but cannot edit medical information or sign trip/event/medical consent on the child's behalf.
      </p>
      <GuardianTutoringApprovalPanel onFlash={onFlash} />
    </div>
  );
}

// Independent Teacher Enrollment — guardian side: a minor's tutoring invitation cannot become
// active without this (spec: "Minor student ke liye linked parent/guardian approval mandatory").
function GuardianTutoringApprovalPanel({ onFlash }) {
  const [links, setLinks] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() { apiRequest('/teacher-students/pending-guardian-approval').then(setLinks).catch(() => setLinks([])); }
  useEffect(load, []);

  async function decide(id, approved) {
    setBusyId(id);
    try { await apiRequest(`/teacher-students/${id}/guardian-approve`, { method: 'PATCH', body: { approved } }); onFlash(approved ? 'Approved.' : 'Declined.', 'success'); load(); }
    catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  if (links === null || links.length === 0) return null;
  return (
    <div className="admin-section" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Tutoring Approval Needed</h2><p>Your child was invited to independent tutoring and needs your consent before it can start.</p></div></div>
      {links.map((l) => (
        <div key={l._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sand-line)' }}>
          <div>
            <strong className="text-sm">{l.teacher?.fullName}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>For {l.student?.fullName} — {l.course?.title}{l.subject ? ` (${l.subject})` : ''}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === l._id} onClick={() => decide(l._id, true)}>Approve</button>
            <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === l._id} onClick={() => decide(l._id, false)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Shared: Messages & Notifications

function MessagesPanel({ onFlash, user, restrictedStaffMessaging = false, initialUser, onConsumedInitialUser }) {
  const [conversations, setConversations] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [newRecipientId, setNewRecipientId] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const { socket, refreshUnreadMessages } = useRealtime();

  const [view, setView] = useUrlTab('messagesPanel', 'direct'); // 'direct' | 'groups'
  const [groups, setGroups] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState(null);
  const [groupText, setGroupText] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', memberIds: [] });
  const [creatingGroup, setCreatingGroup] = useState(false);

  function loadGroups() {
    apiRequest('/group-conversations/mine').then(setGroups).catch((err) => onFlash(err.message));
  }

  function loadConversations() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    loadConversations();
    if (!restrictedStaffMessaging) loadGroups();
    apiRequest('/messages/contacts').then(setContacts).catch((err) => onFlash(err.message));
  }, [restrictedStaffMessaging]);

  useEffect(() => {
    if (!socket || !activeGroup) return undefined;
    socket.emit('group:join', { groupId: activeGroup._id }, () => {});
    function onGroupMessage(msg) { setGroupMessages((prev) => (prev ? [...prev, msg] : [msg])); }
    socket.on('group:message', onGroupMessage);
    return () => { socket.off('group:message', onGroupMessage); socket.emit('group:leave', { groupId: activeGroup._id }, () => {}); };
  }, [socket, activeGroup]);

  function openGroup(g) {
    setActiveGroup(g);
    setGroupMessages(null);
    apiRequest(`/group-conversations/${g._id}/messages`).then(setGroupMessages).catch((err) => onFlash(err.message));
  }

  async function sendGroupMessage(e) {
    e.preventDefault();
    if (!groupText.trim() || !activeGroup) return;
    try {
      await apiRequest(`/group-conversations/${activeGroup._id}/messages`, { method: 'POST', body: { text: groupText.trim() } });
      setGroupText('');
    } catch (err) { onFlash(err.message); }
  }

  function toggleGroupMember(id) {
    setGroupForm((f) => ({ ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id] }));
  }

  async function createGroup(e) {
    e.preventDefault();
    if (!groupForm.name.trim() || groupForm.memberIds.length < 2) return onFlash('Group name and at least 2 members are required.');
    setCreatingGroup(true);
    try {
      await apiRequest('/group-conversations', { method: 'POST', body: { name: groupForm.name.trim(), memberIds: groupForm.memberIds } });
      onFlash('Group created.', 'success');
      setGroupForm({ name: '', memberIds: [] });
      setShowCreateGroup(false);
      loadGroups();
    } catch (err) { onFlash(err.message); } finally { setCreatingGroup(false); }
  }

  async function leaveGroup() {
    if (!activeGroup) return;
    try { await apiRequest(`/group-conversations/${activeGroup._id}/leave`, { method: 'PATCH' }); onFlash('Left group.', 'success'); setActiveGroup(null); loadGroups(); } catch (err) { onFlash(err.message); }
  }

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = (message) => {
      loadConversations();
      if (activeUser && [message?.from?._id || message?.from, message?.to?._id || message?.to].map(String).includes(String(activeUser._id))) {
        apiRequest(`/messages/with/${activeUser._id}`).then(setThread).catch(() => {});
      }
    };
    const onDelivered = ({ to }) => {
      if (activeUser && String(to) === String(activeUser._id)) {
        apiRequest(`/messages/with/${activeUser._id}`).then(setThread).catch(() => {});
      }
    };
    socket.on('message:new', refresh);
    socket.on('message:read', refresh);
    socket.on('message:delivered', onDelivered);
    return () => { socket.off('message:new', refresh); socket.off('message:read', refresh); socket.off('message:delivered', onDelivered); };
  }, [socket, activeUser]);

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(() => { loadConversations(); refreshUnreadMessages(); }).catch(() => {});
  }

  async function blockActiveUser() {
    if (!activeUser) return;
    const confirmed = await showConfirm(`Block ${activeUser.fullName}? They will no longer be able to message you, even if you share a class or institution.`, { title: 'Block user', danger: true, confirmLabel: 'Block' });
    if (!confirmed) return;
    try { await apiRequest(`/messages/block/${activeUser._id}`, { method: 'POST' }); onFlash('User blocked.', 'success'); setActiveUser(null); setThread(null); } catch (err) { onFlash(err.message); }
  }

  async function reportActiveUser() {
    if (!activeUser) return;
    const description = await showPrompt(`Describe the issue with ${activeUser.fullName}.`, { title: 'Report user', required: true, placeholder: 'What happened?' });
    if (!description) return;
    try { await apiRequest('/complaints', { method: 'POST', body: { subject: `Reported: ${activeUser.fullName}`, category: 'harassment', description, targetType: 'user', targetId: activeUser._id,messageIds:(thread||[]).slice(-20).map(m=>m._id) } }); onFlash('Report submitted — Admin will review it.', 'success'); } catch (err) { onFlash(err.message); }
  }

  // Arrived here via a specific person (e.g. Teacher -> Student Communication -> Message) rather
  // than the generic "paste a User ID" box — open that conversation immediately.
  useEffect(() => {
    if (!initialUser) return;
    openThread(initialUser);
    onConsumedInitialUser?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  async function send(e) {
    e.preventDefault();
    const formEl = e.currentTarget; // captured now — after an await, the event's currentTarget is null
    const toId = activeUser?._id || newRecipientId.trim();
    if (!toId || !text.trim()) return;
    setSending(true);
    try {
      const attachments = [];
      if (attachment) attachments.push({ name: attachment.name, type: attachment.type, url: await uploadToPlatformStorage(attachment, 'messages') });
      await apiRequest('/messages', { method: 'POST', body: { to: toId, text: text.trim(), attachments } });
      setText('');
      setAttachment(null);
      formEl?.reset();
      if (activeUser) {
        apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      } else {
        setNewRecipientId('');
        onFlash('Message sent.', 'success');
      }
      loadConversations();
    } catch (err) { onFlash(err.message); } finally { setSending(false); }
  }

  return (
    <div className="institution-ui institution-remaining-ui institution-messages-ui">
      {!restrictedStaffMessaging && <nav className="cz-tabbar" style={{ marginBottom: 18 }}>
        <button type="button" aria-pressed={view === 'direct'} className={`cz-tab${view === 'direct' ? ' active' : ''}`} onClick={() => setView('direct')}>Direct</button>
        <button type="button" aria-pressed={view === 'groups'} className={`cz-tab${view === 'groups' ? ' active' : ''}`} onClick={() => setView('groups')}>Groups</button>
      </nav>}

      {!restrictedStaffMessaging && view === 'groups' && (
        <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
              <h3 className="font-semibold" style={{ margin: 0 }}>Groups</h3>
              <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowCreateGroup((s) => !s)}>+ New Group</button>
            </div>
            {showCreateGroup && (
              <form onSubmit={createGroup} className="card" style={{ padding: 16, marginBottom: 16, display: 'grid', gap: 10 }}>
                <input className="form-input" placeholder="Group name" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} />
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pick at least 2 approved contacts:</p>
                <div style={{ maxHeight: 180, overflowY: 'auto', display: 'grid', gap: 6 }}>
                  {contacts.map((c) => (
                    <label key={c.user._id} className="flex items-center text-sm" style={{ gap: 8 }}>
                      <input type="checkbox" checked={groupForm.memberIds.includes(c.user._id)} onChange={() => toggleGroupMember(c.user._id)} />
                      {c.user.fullName} <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>({c.relationship})</span>
                    </label>
                  ))}
                  {contacts.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No approved contacts yet.</p>}
                </div>
                <button type="submit" className="btn btn-primary" disabled={creatingGroup} style={{ justifySelf: 'start' }}>{creatingGroup ? 'Creating...' : 'Create Group'}</button>
              </form>
            )}
            {groups === null && <p role="status" className="admin-notice">Loading...</p>}
            {groups && groups.length === 0 && (
              <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
                <FaCommentDots aria-hidden="true" />
                <p>No groups yet</p>
                <span>Create one from your approved contacts.</span>
              </div>
            )}
            <div className="dash-list">
              {(groups || []).map((g) => (
                <div key={g._id} className={`dash-list-item${activeGroup?._id === g._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openGroup(g)}>
                  <span className="dash-list-icon c-forest" aria-hidden><FaUsers size={14} /></span>
                  <div className="dash-list-body"><div className="title">{g.name}</div><div className="desc">{g.participants.length} members</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <h3 className="font-semibold" style={{ margin: 0 }}>{activeGroup ? activeGroup.name : 'Select a group'}</h3>
              {activeGroup && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={leaveGroup}>Leave</button>}
            </div>
            {activeGroup && (
              <>
                <div className="card reveal in" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 320, overflowY: 'auto' }}>
                  {groupMessages === null && <p role="status" className="admin-notice">Loading...</p>}
                  {groupMessages && groupMessages.length === 0 && (
                    <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
                      <p>No messages yet</p><span>Say hello to start the group.</span>
                    </div>
                  )}
                  {(groupMessages || []).map((m, idx) => (
                    <div key={m._id} style={{ padding: '10px 4px', borderBottom: idx < groupMessages.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                      <strong className="text-xs">{m.from?.fullName}</strong>
                      <div style={{ fontSize: 13 }}>{m.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendGroupMessage} className="flex items-end" style={{ gap: 12 }}>
                  <input className="form-input" placeholder="Message the group..." value={groupText} onChange={(e) => setGroupText(e.target.value)} required style={{ flex: '1 1 auto' }} />
                  <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {view === 'direct' && (
    <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold" style={{ marginBottom: 18 }}>{restrictedStaffMessaging ? 'Assigned Students' : 'Conversations'}</h3>
        {conversations === null && <p role="status" className="admin-notice">Loading...</p>}
        {conversations && conversations.length === 0 && (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
            <span>Select an approved contact to start a conversation.</span>
          </div>
        )}
        <div className="dash-list">
          {(conversations || []).map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <h3 className="font-semibold" style={{ margin: 0 }}>{activeUser ? activeUser.fullName : 'New Message'}</h3>
          {activeUser && (
            <span className="flex items-center" style={{ gap: 6 }}>
              <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => blockActiveUser()}>Block</button>
              <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => reportActiveUser()}>Report</button>
            </span>
          )}
        </div>
        {!activeUser && (
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Approved recipient</span>
            <select className="form-select" value={newRecipientId} onChange={(e) => setNewRecipientId(e.target.value)} required>
              <option value="">{restrictedStaffMessaging ? 'Select assigned student…' : 'Select student, teacher, parent or institution…'}</option>
              {contacts.map((contact) => <option key={contact.user._id} value={contact.user._id}>{contact.user.fullName} — {contact.relationship}{contact.context ? ` · ${contact.context}` : ''}</option>)}
            </select>
          </label>
        )}
        {activeUser && (
          <div className="card reveal in" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 320, overflowY: 'auto' }}>
            {thread === null && <p role="status" className="admin-notice">Loading...</p>}
            {thread && thread.length === 0 && (
              <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
                <p>No messages yet</p>
                <span>Say hello to start the conversation.</span>
              </div>
            )}
            {(thread || []).map((m, idx) => {
              const mine = (m.from?._id || m.from) === user?._id;
              const status = m.read ? 'Read' : m.deliveredAt ? 'Delivered' : 'Sent';
              return (
                <div key={m._id} style={{ padding: '10px 4px', borderBottom: idx < thread.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  {(m.attachments || []).map((file) => <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="btn" style={{ display: 'inline-flex', padding: '4px 9px', fontSize: 11, marginTop: 6 }}>Open {file.name}</a>)}
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
                    {new Date(m.createdAt).toLocaleString()}
                    {mine && <span style={{ marginLeft: 6, color: status === 'Read' ? 'var(--emerald)' : 'var(--ink-soft)' }}>· {status === 'Read' ? '✓✓ Read' : status === 'Delivered' ? '✓✓ Delivered' : '✓ Sent'}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required />
            <label className="message-attachment"><span>Attach a file</span><input type="file" aria-label="Attach a file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />{attachment && <small>{attachment.name}</small>}</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
        </form>
      </div>
    </div>
      )}
    </div>
  );
}

function NotificationsPanel({ onFlash }) {
  const navigateTo = useNavigate();
  const [notifications, setNotifications] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { refreshUnreadNotifications } = useRealtime();

  function load() {
    apiRequest('/notifications/mine').then(setNotifications).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, []);

  async function markRead(id) {
    try { await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }); await refreshUnreadNotifications(); load(); } catch (err) { onFlash(err.message); }
  }
  async function markAllRead() {
    try { await apiRequest('/notifications/mine/read-all', { method: 'PATCH' }); await refreshUnreadNotifications(); load(); } catch (err) { onFlash(err.message); }
  }

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div className="institution-ui institution-remaining-ui institution-notifications-ui">
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h3 className="font-semibold">Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setShowSettings(!showSettings)}>{showSettings ? 'Hide settings' : 'Notification settings'}</button>
          {unreadCount > 0 && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={markAllRead}>Mark all read</button>}
        </div>
      </div>
      {showSettings && <AlertSettings onFlash={onFlash} />}
      {notifications === null && <p role="status" className="admin-notice">Loading...</p>}
      {notifications && notifications.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBell aria-hidden="true" />
          <p>No notifications yet</p>
          <span>Updates and reminders that matter to you will show up here.</span>
        </div>
      )}
      {notifications && notifications.length > 0 && (
        <div className="dash-list" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, background: 'var(--paper-raised)', overflow: 'hidden', gap: 0 }}>
          {notifications.map((n, idx) => (
            <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ cursor: notificationLink(n) ? 'pointer' : 'default', borderBottom: idx < notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }} onClick={() => { if (!n.read) markRead(n._id); const to = notificationLink(n); if (!to) return; if (/^https?:/.test(to)) window.location.assign(to); else navigateTo(to); }}>
              <span className="dash-list-icon c-forest" aria-hidden><FaBell size={14} /></span>
              <div className="dash-list-body"><div className="title">{n.title}</div><div className="desc">{n.body || (notificationLink(n) ? 'Open to see the details.' : '')}</div>{notificationLink(n) && <div className="desc" style={{ color: 'var(--emerald)', fontWeight: 600, marginTop: 4 }}>Open →</div>}</div>
              <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Aggregates whichever real, role-appropriate schedule data the current account
// has access to (weekly timetable, fee due dates, assignment due dates). Tries
// each source independently so it degrades gracefully for roles with none of them,
// rather than hard-coding a role check here.
const CAL_EVENT_COLOR = { class: 'var(--forest)', assignment: 'var(--gold)', exam: 'var(--rose)', fee: 'var(--emerald)', goal: 'var(--emerald)' };
const CAL_EVENT_LABEL = { class: 'Class', assignment: 'Assignment', exam: 'Exam', fee: 'Fee due', goal: 'Goal due' };

function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

function CalendarPanel({ onFlash }) {
  const [timetable, setTimetable] = useState(null);
  const [fees, setFees] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState(null);
  const [pendingExams, setPendingExams] = useState(null);
  const [goals, setGoals] = useState([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    apiRequest('/students/me/timetable').then(setTimetable).catch(() => {
      apiRequest('/teachers/me/timetable').then(setTimetable).catch(() => setTimetable([]));
    });
    apiRequest('/students/me/fees').then(setFees).catch(() => setFees([]));
    // Real pending (not-yet-submitted) assignments with real due dates — same source
    // the dashboard home page's Assignment Overview uses, not "already submitted" ones.
    apiRequest('/students/me/dashboard').then((dash) => setPendingAssignments(dash.pendingAssignments)).catch(() => setPendingAssignments([]));
    // Real exam dates — the dashboard's own pendingExams has no scheduledDate, so this
    // walks enrollments -> per-course /exams the same way the Assignments page already does.
    apiRequest('/students/me/enrollments').then(async (enrollments) => {
      const active = enrollments.filter((e) => e.course);
      const lists = await Promise.all(active.map((e) =>
        apiRequest(`/courses/${e.course._id}/exams`).then((list) => list.map((ex) => ({ ...ex, courseTitle: e.course.title }))).catch(() => [])
      ));
      setPendingExams(lists.flat().filter((ex) => ex.scheduledDate));
    }).catch(() => setPendingExams([]));
    // Goal target dates — only students have this endpoint; other roles silently get none.
    apiRequest('/students/me/goals').then((list) => setGoals(list.filter((g) => g.status === 'active' && g.targetDate))).catch(() => setGoals([]));
  }, []);

  const loading = timetable === null || fees === null || pendingAssignments === null || pendingExams === null;

  // Every event, bucketed by calendar date-key, for the currently viewed month.
  const eventsByDate = {};
  function addEvent(date, type, title, detail) {
    if (!date) return;
    const key = dateKey(date);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push({ type, title, detail });
  }

  if (!loading) {
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

    // Recurring weekly classes -> every real calendar occurrence inside the visible month.
    (timetable || []).forEach((t) => {
      const targetDow = DOW_INDEX[t.dayOfWeek];
      if (targetDow === undefined) return;
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === targetDow) addEvent(new Date(d), 'class', t.subject, `${formatTime12h(t.startTime)}–${formatTime12h(t.endTime)}${t.room ? ` · ${t.room}` : ''}`);
      }
    });
    (pendingAssignments || []).forEach((a) => { if (a.dueDate) addEvent(new Date(a.dueDate), 'assignment', a.title, 'Due date'); });
    (pendingExams || []).forEach((e) => { if (e.scheduledDate) addEvent(new Date(e.scheduledDate), 'exam', e.title, e.courseTitle || ''); });
    (fees || []).filter((f) => f.status !== 'paid' && f.dueDate).forEach((f) => addEvent(new Date(f.dueDate), 'fee', f.title, `${f.currency} ${f.amount}`));
    (goals || []).forEach((g) => addEvent(new Date(g.targetDate), 'goal', g.title, `${g.progressPercent}% complete`));
  }

  const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];
  const today = new Date();
  const selectedEvents = eventsByDate[dateKey(selectedDate)] || [];

  return (
    <div className="institution-ui institution-remaining-ui institution-calendar-ui">
      <h3 className="font-semibold mb-3">Calendar</h3>
      {loading && <p role="status" className="admin-notice">Loading...</p>}

      {!loading && (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: 14, padding: '10px 16px', background: 'var(--paper-raised)', border: '1px solid var(--sand-line)', borderRadius: 14 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>‹ Prev</button>
            <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>Next ›</button>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 16, marginBottom: 14 }}>
            {Object.entries(CAL_EVENT_LABEL).map(([type, label]) => (
              <span key={type} className="flex items-center text-xs" style={{ gap: 6, color: 'var(--ink-soft)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAL_EVENT_COLOR[type], display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4" style={{ textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="text-xs font-semibold" style={{ color: 'var(--ink-soft)', padding: '4px 0' }}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const key = dateKey(cellDate);
              const isToday = dateKey(today) === key;
              const isSelected = dateKey(selectedDate) === key;
              const dayEvents = eventsByDate[key] || [];
              return (
                <button
                  type="button" key={i} onClick={() => setSelectedDate(cellDate)}
                  className="card" style={{
                    padding: '6px 2px', cursor: 'pointer', minHeight: 46,
                    border: isSelected ? '2px solid var(--forest)' : isToday ? '1px solid var(--forest)' : '1px solid var(--sand-line)',
                    background: isSelected ? 'var(--sand)' : 'transparent'
                  }}
                >
                  <div className="text-xs">{day}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...new Set(dayEvents.map((e) => e.type))].slice(0, 4).map((type) => (
                      <span key={type} style={{ width: 5, height: 5, borderRadius: '50%', background: CAL_EVENT_COLOR[type], display: 'inline-block' }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <strong className="text-sm" style={{ fontFamily: 'Fraunces, serif', fontSize: 15 }}>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            {selectedEvents.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Nothing scheduled on this date.</p>}
            {selectedEvents.map((e, i) => (
              <div key={i} className="flex items-center" style={{ gap: 8, marginTop: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAL_EVENT_COLOR[e.type], display: 'inline-block', flexShrink: 0 }} />
                <p className="text-xs">{CAL_EVENT_LABEL[e.type]}: <strong>{e.title}</strong> {e.detail ? `— ${e.detail}` : ''}</p>
              </div>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 20, fontStyle: 'italic' }}>Personal events aren't supported yet — this calendar only shows real classes, assignments, exams and fee deadlines pulled from your account.</p>

          {(timetable && timetable.length > 0) && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Upcoming Classes</h4>
              <Table
                headers={['Next Date', 'Day', 'Time', 'Subject', 'Room']}
                rows={timetable.map((t) => {
                  const nextDate = nextDateForDow(t.dayOfWeek, t.startTime);
                  return [nextDate ? nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—', DOW_LABEL[t.dayOfWeek], `${formatTime12h(t.startTime)}–${formatTime12h(t.endTime)}`, t.subject, t.room || '—'];
                })}
                empty="No classes scheduled."
              />
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Assignments</h4>
            <Table
              headers={['Assignment', 'Due']}
              rows={(pendingAssignments || []).map((a) => [a.title, a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'])}
              empty="No pending assignments."
            />
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Exams</h4>
            <Table
              headers={['Exam', 'Course', 'Scheduled']}
              rows={(pendingExams || []).map((e) => [e.title, e.courseTitle || '—', new Date(e.scheduledDate).toLocaleString()])}
              empty="No upcoming exams."
            />
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Fee Due Dates (Deadlines)</h4>
            <Table
              headers={['Title', 'Amount', 'Due']}
              rows={(fees || []).filter((f) => f.status !== 'paid' && f.dueDate).map((f) => [f.title, `${f.currency} ${f.amount}`, new Date(f.dueDate).toLocaleDateString()])}
              empty="No upcoming fees."
            />
          </div>
        </>
      )}
    </div>
  );
}

function SettingsPanel({ user, onFlash, onChanged }) {
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', country: user?.country || '', language: user?.language || 'en', profilePhoto: user?.profilePhoto || '', companyName: user?.companyName || '', donorType: user?.donorType || '' });
  const [twoFactor, setTwoFactor] = useState(!!user?.twoFactorEnabled);
  const [savingTwoFactor, setSavingTwoFactor] = useState(false);
  const isDonor = user?.roles?.includes('donor');
  const isSeller = user?.roles?.includes('marketplace_seller');
  const showCompanyName = user?.roles?.includes('employer') || user?.roles?.includes('education_agent') || isSeller || (isDonor && form.donorType === 'organization');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: form });
      onFlash('Settings saved.', 'success');
      onChanged?.();
      return true;
    } catch (err) { onFlash(err.message); }
  }

  async function toggleTwoFactor(next) {
    setSavingTwoFactor(true);
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: { twoFactorEnabled: next } });
      setTwoFactor(next);
      onFlash(next ? 'Two-factor authentication enabled — you\'ll get an email code at every login.' : 'Two-factor authentication disabled.', 'success');
      onChanged?.(); return true;
    } catch (err) { onFlash(err.message); } finally { setSavingTwoFactor(false); }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (passwordError(pwForm.newPassword)) { onFlash(passwordError(pwForm.newPassword)); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { onFlash('New passwords do not match.'); return; }
    try {
      await apiRequest('/users/me/password', { method: 'PATCH', body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword } });
      onFlash('Password updated.', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); return true;
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="institution-ui institution-remaining-ui institution-account-settings-ui">
      <h3 className="font-semibold mb-3">Account Settings</h3>
      <PushNotificationToggle onFlash={onFlash} />
      <section className="acct-section"><div className="acct-section-head"><h4>Profile</h4><p>Your photo, name and contact details.</p></div>
      <SavedForm key={user._id} value={form} onRestore={setForm} onSubmit={saveProfile} className="acct-form">
        <div className="acct-photo-row">
          {form.profilePhoto
            ? <img src={form.profilePhoto} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>{(form.fullName || '?')[0]}</div>}
          <label className="institution-field" style={{ flex: 1, minWidth: 0 }}><span>Profile photo URL (paste an image link)</span><input className="form-input" placeholder="https://…" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} /></label>
        </div>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: -4 }}>No file storage is wired up yet — upload your photo somewhere (Google Drive, Imgur, etc.), share it publicly, and paste the direct image link here.</p>
        <label className="institution-field"><span>Full name</span><input className="form-input" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
        {isDonor && (
          <label className="institution-field"><span>Donor type</span><select className="form-select" value={form.donorType} onChange={(e) => setForm({ ...form, donorType: e.target.value })}>
            <option value="">Select donor type</option>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
          </select></label>
        )}
        {showCompanyName && <label className="institution-field"><span>{isDonor ? 'Organization name' : isSeller ? 'Store name' : 'Company / Agency name'}</span><input className="form-input" placeholder={isDonor ? 'Organization name' : isSeller ? 'Store name' : 'Company / Agency name'} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></label>}
        {isSeller && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: -4 }}>The profile photo above also doubles as your store logo.</p>}
        <label className="institution-field"><span>Phone</span><input className="form-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="institution-field"><span>Country code (e.g. PK)</span><input className="form-input" placeholder="Country code (e.g. PK)" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
        <label className="institution-field"><span>Language</span><select className="form-select" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
          <option value="en">English</option>
          <option value="ur">Urdu</option>
          <option value="ar">Arabic</option>
        </select></label>
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Save Settings</button>
      </SavedForm></section>

      <section className="acct-section"><div className="acct-section-head"><h4>Change Password</h4><p>Use at least 8 characters.</p></div>
      <SavedForm showValues={false} value={pwForm} onRestore={setPwForm} editLabel="Change password" onSubmit={changePassword} className="acct-form">
        <label className="institution-field"><span>Current password</span><input className="form-input" type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required /></label>
        <label className="institution-field"><span>New password</span><input className="form-input" type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} /></label>
        <label className="institution-field"><span>Confirm new password</span><input className="form-input" type="password" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={8} /></label>
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Update Password</button>
      </SavedForm></section>

      <section className="acct-section"><div className="acct-section-head"><h4>Two-Factor Authentication</h4><p>An extra check when you sign in.</p></div>
      <SavedForm value={twoFactor} onRestore={setTwoFactor} onSubmit={()=>toggleTwoFactor(twoFactor)} className="acct-form">
        <div className="acct-2fa">
          <div style={{ minWidth: 0 }}>
            <p className="text-sm" style={{ fontWeight: 700, margin: 0 }}><span className={`acct-2fa-state${twoFactor ? ' on' : ''}`}>{twoFactor ? 'Enabled' : 'Disabled'}</span></p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.6 }}>{twoFactor ? (user?.twoFactorMethod === 'totp' ? 'At every sign-in you enter the code from your authenticator app — password alone is not enough.' : 'A login code is emailed to you every time you sign in — password alone is not enough.') : 'Add an extra step at login: a one-time code emailed to you after your password.'}</p>
          </div>
          <label className="acct-switch" style={{ cursor: savingTwoFactor ? 'wait' : 'pointer' }}>
            <input type="checkbox" checked={twoFactor} disabled={savingTwoFactor} onChange={(e) => setTwoFactor(e.target.checked)} /><span aria-hidden="true" /><span>{twoFactor ? 'On' : 'Off'}</span>
          </label>
        </div>
      <button type="submit" className="btn btn-primary" disabled={savingTwoFactor}>Save security settings</button></SavedForm></section>
      <AuthenticatorApp user={user} onFlash={onFlash} onChanged={onChanged} />
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'How do I switch between my roles (e.g. Student and Teacher)?', a: 'If you hold more than one role, a row of tabs appears above your dashboard — click any tab to switch workspaces instantly.' },
  { q: 'I requested a new role — why can\'t I post yet?', a: 'The workspace unlocks immediately, but posting a job, scholarship, listing or course requires Super Admin verification first. You\'ll see a banner while it\'s pending.' },
  { q: 'How do I link my child\'s account as a parent?', a: 'Go to My Children and send a link request by their email — they need to approve it from their own account before you see their data.' },
  { q: 'How do I verify a certificate I received?', a: 'Every certificate has a QR code and a public verification link — anyone can scan or open it without logging in.' },
  { q: 'Who can see my messages?', a: 'Only you and the person you\'re messaging. Institution admins can only review a conversation if a complaint is filed about it.' }
];

function HelpCenterPanel({ onFlash }) {
  return (
    <div className="institution-ui institution-remaining-ui institution-help-ui">
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Frequently Asked Questions</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Quick answers to the questions we hear most.</p>
      <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--emerald)', flexShrink: 0 }}>
              <FaCircleQuestion aria-hidden="true" size={15} />
            </span>
            <div>
              <strong className="text-sm">{item.q}</strong>
              <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
      <SupportComplaintPanel onFlash={onFlash} />
    </div>
  );
}

function Table({ headers, rows, empty, loading = false, error, onRetry }) {
  if (loading) return <p role="status" className="admin-notice">Loading records...</p>;
  if (error) return <div role="alert" className="admin-notice error">{error} <button type="button" onClick={onRetry}>Retry</button></div>;
  return (
    <div className="account-table-wrap overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--sand-line)]">
            {headers.map((h) => <th key={h} className="py-2 pr-4 font-semibold uppercase text-xs tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={headers.length} className="py-3 text-[var(--ink-soft)] italic">{empty}</td></tr>}
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--sand-line)] last:border-0">
              {row.map((cell, j) => <td key={j} data-label={typeof headers[j] === 'string' ? headers[j] : undefined} className="py-2.5 pr-4">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Shared by the workspace files in ./dashboard.
export { AI_PURPOSES, AddListingPanel, AiFeatureCard, AiSettingsPanel, COMPLETION_STATUS_LABEL, ComingSoon, CustomSelect, DOW_LABEL, EmployerEmploymentsPanel, EmployerJobsPanel, EmployerPostJobPanel, GuardianTutoringApprovalPanel, INTERVIEW_STATUS, InstitutionStudentSelect, JOB_APP_STATUS, LiveTransportMap, MyListingsPanel, MyScholarshipsPanel, NotificationsPanel, PRODUCT_STATUS, PTM_STATUS_TAG, PayFeeButton, PayoutRequestForm, PersonPicker, PostScholarshipPanel, ProfilePanel, PtmMeetingDetails, RECEIVED_KINDS, ReceivedDonationsPanel, RolesPanel, SELLER_WITHDRAWAL_STATUS, STAFF_PERMISSION_LABEL, STAFF_ROLE_LABEL, SalaryPayoutProfilePanel, ScholarshipsPanel, SellerOrdersPanel, SellerWalletPanel, SlideDeckViewer, StudentJobsPanel, SummaryCard, SummaryRow, SupportComplaintPanel, Table, Tag, TeacherReputationWidget, TimetableView, downloadFeePdf, fixText, formatTime12h, nextDateForDow, resizeImageToDataUrl, shortWhen, useMyInstitution };
