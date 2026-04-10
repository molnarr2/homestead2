import { useUserStore } from '../store/userStore'
import { bsAuthService } from '../Bootstrap'
import { resetAllStores } from '../store/resetAllStores'

export function useSideMenuController() {
  const user = useUserStore(s => s.user)

  const logout = () => {
    bsAuthService.signout()
    resetAllStores()
  }

  return { user, logout }
}
