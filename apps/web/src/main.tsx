import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './index.css'

// vite-react-ssg entry: in dev it hydrates; at build it pre-renders every route.
export const createRoot = ViteReactSSG({ routes })
