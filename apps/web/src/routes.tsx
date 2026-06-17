import type { RouteRecord } from 'vite-react-ssg'
import { SPECIES_GESTATION } from '@template/common'
import { Layout } from './components/layout/Layout'
import Home from './routes/Home'
import ToolsIndex from './routes/tools/ToolsIndex'
import WithdrawalCalculator from './routes/tools/WithdrawalCalculator'
import GestationCalculator from './routes/tools/GestationCalculator'
import GestationSpecies from './routes/tools/GestationSpecies'
import ScheduleGenerator from './routes/tools/ScheduleGenerator'
import EggFeedCostCalculator from './routes/tools/EggFeedCostCalculator'
import PrintablesIndex from './routes/printables/PrintablesIndex'
import ArticlesIndex from './routes/articles/ArticlesIndex'
import ArticleDetail from './routes/articles/ArticleDetail'
import PrivacyPage from './routes/legal/Privacy'
import TermsPage from './routes/legal/Terms'
import DisclaimerPage from './routes/legal/Disclaimer'
import NotFound from './routes/NotFound'
import { ARTICLES } from './content/articles'

// Single route manifest — vite-react-ssg crawls these at build time and emits a
// real index.html per path (plus the dynamic getStaticPaths variants).
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, Component: Home },
      { path: 'tools', Component: ToolsIndex },
      { path: 'tools/medication-withdrawal-calculator', Component: WithdrawalCalculator },
      { path: 'tools/gestation-calculator', Component: GestationCalculator },
      {
        path: 'tools/gestation-calculator/:species',
        Component: GestationSpecies,
        entry: 'src/routes/tools/GestationSpecies.tsx',
        getStaticPaths: () => SPECIES_GESTATION.map((s) => `/tools/gestation-calculator/${s.slug}`),
      },
      { path: 'tools/deworming-vaccination-schedule', Component: ScheduleGenerator },
      { path: 'tools/chicken-egg-feed-cost-calculator', Component: EggFeedCostCalculator },
      { path: 'printables', Component: PrintablesIndex },
      { path: 'articles', Component: ArticlesIndex },
      {
        path: 'articles/:slug',
        Component: ArticleDetail,
        entry: 'src/routes/articles/ArticleDetail.tsx',
        getStaticPaths: () => ARTICLES.map((a) => `/articles/${a.slug}`),
      },
      { path: 'privacy', Component: PrivacyPage },
      { path: 'terms', Component: TermsPage },
      { path: 'disclaimer', Component: DisclaimerPage },
      { path: '*', Component: NotFound },
    ],
  },
]
