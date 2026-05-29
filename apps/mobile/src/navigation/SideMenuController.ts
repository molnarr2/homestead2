import { useUserStore } from '../store/userStore'
import { bsAuthService } from '../Bootstrap'
import { teardownApp } from '../store/appInitializer'

export function useSideMenuController() {
  const user = useUserStore(s => s.user)

  const logout = () => {
    bsAuthService.signout()
    teardownApp()
  }

  return { user, logout }
}
