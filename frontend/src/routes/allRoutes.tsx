import Autosize from "@pages/form/autosize";
import BasicInput from "@pages/form/basic-input";
import CheckboxRadio from "@pages/form/checkbox-radio";
import Clipboards from "@pages/form/clipboard";
import FileInput from "@pages/form/file-input";
import InputGroup from "@pages/form/input-group";
import InputSpin from "@pages/form/input-spin";
import Pickers from "@pages/form/pickers";
import Range from "@pages/form/range";
import Recaptcha from "@pages/form/recaptcha";
import SelectPage from "@pages/form/select";
import Switches from "@pages/form/switches";
import WizardBasic from "@pages/form/wizard-basic";
import { ReactNode } from "react";
import Accodion from "@pages/ui/accordion";
import Alerts from "@pages/ui/alerts";
import AdvancedEffect from "@pages/ui/advanced3dEffect";
import AdvancedAnimation from "@pages/ui/advancedAnimation";
import Boat from "@pages/ui/advancedBot";
import Highlight from "@pages/ui/advancedHighlight";
import BaseTables from "@pages/table/base";
import BasicTables from "@pages/table/datatables/basic";
import Bordered from "@pages/table/datatables/bordered";
import Stripe from "@pages/table/datatables/stripe";
import Hover from "@pages/table/datatables/hover";
import RowGrouPing from "@pages/table/datatables/rowGrouping";
import AreaCharts from "@pages/apexchart/area";
import BarCharts from "@pages/apexchart/bar";
import BoxWhisker from "@pages/apexchart/boxWhisker";
import BubbleChart from "@pages/apexchart/bubble";
import CandlestickCharts from "@pages/apexchart/candlestick";
import ColumnCharts from "@pages/apexchart/column";
import FunnelCharts from "@pages/apexchart/funnel";
import HeatmapCharts from "@pages/apexchart/heatmap";
import LineCharts from "@pages/apexchart/line";
import MixedCharts from "@pages/apexchart/mixed";
import PieChart from "@pages/apexchart/pie";
import PolarAreaCharts from "@pages/apexchart/polar-area";
import RadarCharts from "@pages/apexchart/radar";
import RadialbarCharts from "@pages/apexchart/radialbar";
import RangeAreaCharts from "@pages/apexchart/rangeArea";
import ScatterCharts from "@pages/apexchart/scatter";
import SlopeCharts from "@pages/apexchart/slope";
import TimelineChart from "@pages/apexchart/timeline";
import TreemapCharts from "@pages/apexchart/treemap";
import ApexTreeLeftRightChart from "@pages/apextree/leftRight";
import ApexTreeTopBottomChart from "@pages/apextree/topBottom";
import ApexTreeBottomTopChart from "@pages/apextree/bottomTop";
import ApexTreeRightLeftChart from "@pages/apextree/rightLeft";
import Mask from "@pages/ui/advancedMask";
import Simplebar from "@pages/ui/advancedSimplebar";
import SwiperElement from "@pages/ui/advancedSwiper";
import Tree from "@pages/ui/advancedTree";
import WordCounters from "@pages/ui/advancedWordCounter";
import ImageAnnotation from "@pages/ui/advancedImageAnnotation";
import Badge from "@pages/ui/badge";
import BreadCrumbs from "@pages/ui/breadCrumb";
import ButtonsGroup from "@pages/ui/buttonsGroup";
import Button from "@pages/ui/buttons";
import ButtonNavigation from "@pages/ui/buttonNavigation";
import Cards from "@pages/ui/cards";
import Colors from "@pages/ui/colors";
import Cookies from "@pages/ui/cookie";
import Drawer from "@pages/ui/drawer";
import Dropdowns from "@pages/ui/dropdown";
import Gallerys from "@pages/ui/gallery";
import Links from "@pages/ui/links";
import ListGroups from "@pages/ui/listGroup";
import Loader from "@pages/ui/loader";
import Modals from "@pages/ui/modal";
import Notifications from "@pages/ui/notification";
import Paginations from "@pages/ui/pagination";
import ProgressBars from "@pages/ui/progressBar";
import Tabs from "@pages/ui/tabs";
import TimeLine from "@pages/ui/timeLine";
import Tooltips from "@pages/ui/toolTips";
import Typographys from "@pages/ui/typography";
import Videos from "@pages/ui/video";
import WidgetsBanners from "@pages/widgets/banners";
import WidgetsCard from "@pages/widgets/cards";
import WidgetsCharts from "@pages/widgets/charts";
import WidgetsData from "@pages/widgets/widgetsData";
import ApexTreeCollapseExpandChart from "@pages/apextree/collapseExpand";
import BarEcharts from "@pages/echart/bar";
import LineECharts from "@pages/echart/line";
import PieECharts from "@pages/echart/pie";
import Analytics from "@pages/dashboards/analytics";
import Starter from "@pages/page/starter";
import ContactUs from "@pages/page/contactUs";
import ComingSoon from "@pages/page/comingSoon";
import Maintenance from "@pages/page/maintenance";
import PageNotFoundError from "@pages/page/404";
import FiveZeroZero from "@pages/page/500";
import MapComponent from "@pages/maps/google";
import VectorMaps from "@pages/maps/vector";
import EnableDisable from "@pages/table/datatables/enableDisable";
import ApexSankeyChart from "@src/pages/apexSankey";
import Doctors from "@pages/landing/doctors";
import Ecommerce from "@pages/landing/ecommerce";
import Invoice from "@pages/landing/invoice";
import SignInBasicPage from "@pages/auth/signinBasic";
import SignInModernPage from "@pages/auth/signinModern";
import SignInCreativePage from "@pages/auth/signinCreative";
import SignUpBasicPage from "@pages/auth/signupBasic";
import SignUpCreativePage from "@pages/auth/signupCreative";
import SignUpModernPage from "@pages/auth/signupModern";
import Avatar from "@pages/ui/avatar/page";
import Lucide from "@pages/icons/lucide";
import Remix from "@pages/icons/remix";
import Heroiocns from "@pages/icons/heroicons";
import Boxicon from "@pages/icons/boxicon";
import LineAwesome from "@pages/icons/lineAwesome";
import SignInClinica from "@pages/auth/signinClinica";
import UsuariosPage from "@pages/admin/usuarios";
import Dashboard from "@pages/dashboard";
import PacientesList from "@pages/pacientes";
import PacienteForm from "@pages/pacientes/form";
import SalasList from "@pages/salas";
import SalaForm from "@pages/salas/form";
import ParceirosList from "@pages/parceiros";
import ParceiroForm from "@pages/parceiros/form";
import { ProdutosLista } from "@pages/produtos/ProdutosLista";
import { ProdutoForm } from "@pages/produtos/ProdutoForm";
import CategoriasPage from "@pages/categorias";
import CategoriaForm from "@pages/categorias/CategoriaForm";
import AgendamentosPage from "@pages/agendamentos";
import AgendamentosLista from "@pages/agendamentos/lista";
import AgendamentosCalendario from "@pages/agendamentos/calendario";
import AgendamentosHorarios from "@pages/agendamentos/horarios";
import NovoAgendamento from "@pages/agendamentos/novo";
import EditarAgendamento from "@pages/agendamentos/editar";
import Calendario from "@pages/agendamentos/calendario";
import AgendaHorarios from "@pages/agendamentos/horarios";
import FormElements from "@pages/forms/formElements";
import FormLayout from "@pages/forms/formLayout";
import ConfiguracaoHorarios from "@pages/configuracoes/horarios";
import TesteHorarios from "@pages/configuracoes/teste-horarios";
import DisponibilidadeParceiro from "@pages/parceiros/disponibilidade";

interface IRoute {
  path: string;
  component: ReactNode;
}

const routes: IRoute[] = [
  // Dashboard principal - Clínica Essencial
  { path: "/", component: <Dashboard /> },
  { path: "/dashboard", component: <Dashboard /> },
  
  // Administração
  { path: "/admin/usuarios", component: <UsuariosPage /> },
  
  // Gestão de Pacientes
  { path: "/pacientes", component: <PacientesList /> },
  { path: "/pacientes/novo", component: <PacienteForm /> },
  { path: "/pacientes/editar/:id", component: <PacienteForm /> },
  
  // Gestão de Salas
  { path: "/salas", component: <SalasList /> },
  { path: "/salas/nova", component: <SalaForm /> },
  { path: "/salas/editar/:id", component: <SalaForm /> },
  
  // Gestão de Parceiros
  { path: "/parceiros", component: <ParceirosList /> },
  { path: "/parceiros/novo", component: <ParceiroForm /> },
  { path: "/parceiros/editar/:id", component: <ParceiroForm /> },
  { path: "/parceiros/:id/disponibilidade", component: <DisponibilidadeParceiro /> },
  
  // Gestão de Produtos e Serviços
  { path: "/produtos", component: <ProdutosLista /> },
  { path: "/produtos/novo", component: <ProdutoForm /> },
  { path: "/produtos/editar/:id", component: <ProdutoForm /> },
  
  // Gestão de Categorias
  { path: "/categorias", component: <CategoriasPage /> },
  { path: "/categorias/nova", component: <CategoriaForm /> },
  { path: "/categorias/editar/:id", component: <CategoriaForm /> },
  
  // Sistema de Agendamentos
  { path: "/agendamentos", component: <AgendamentosPage /> },
  { path: "/agendamentos/lista", component: <AgendamentosLista /> },
  { path: "/agendamentos/calendario", component: <AgendamentosCalendario /> },
  { path: "/agendamentos/horarios", component: <AgendamentosHorarios /> },
  { path: "/agendamentos/novo", component: <NovoAgendamento /> },
  { path: "/agendamentos/editar/:id", component: <EditarAgendamento /> },
  
  // Configurações do Sistema
  { path: "/configuracoes/horarios", component: <ConfiguracaoHorarios /> },
  { path: "/configuracoes/teste-horarios", component: <TesteHorarios /> },
  
  // Outras páginas (Analytics do template original)
  { path: "/analytics", component: <Analytics /> },
];

const nonAuthRoutes: IRoute[] = [
  // Páginas de autenticação
  { path: "/login", component: <SignInClinica /> },
  { path: "/auth/signin-clinica", component: <SignInClinica /> },
  
  // Páginas de erro e utilitárias
  { path: "/page/404", component: <PageNotFoundError /> },
  { path: "/page/500", component: <FiveZeroZero /> },
  
  // Outras páginas de auth do template (manter para referência)
  { path: "/auth/signin-basic", component: <SignInBasicPage /> },
  { path: "/auth/signin-modern", component: <SignInModernPage /> },
  { path: "/auth/signin-creative", component: <SignInCreativePage /> },
  { path: "/auth/signup-basic", component: <SignUpBasicPage /> },
  { path: "/auth/signup-modern", component: <SignUpModernPage /> },
  { path: "/auth/signup-creative", component: <SignUpCreativePage /> },
];

export { routes, nonAuthRoutes };
