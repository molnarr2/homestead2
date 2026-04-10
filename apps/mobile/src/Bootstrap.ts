import FirebaseAuth from './library/cloudplatform/firebase/FirebaseAuth'
import AuthService from './core/service/auth/AuthService'
import type IAuthService from './core/service/auth/IAuthService'
import UserService from './feature/user/service/UserService'
import type IUserService from './feature/user/service/IUserService'
import HomesteadService from './feature/homestead/service/HomesteadService'
import type IHomesteadService from './feature/homestead/service/IHomesteadService'
import AnimalService from './feature/animal/service/AnimalService'
import type IAnimalService from './feature/animal/service/IAnimalService'
import CareService from './feature/care/service/CareService'
import type ICareService from './feature/care/service/ICareService'
import HealthService from './feature/health/service/HealthService'
import type IHealthService from './feature/health/service/IHealthService'
import BreedingService from './feature/breeding/service/BreedingService'
import type IBreedingService from './feature/breeding/service/IBreedingService'
import ProductionService from './feature/production/service/ProductionService'
import type IProductionService from './feature/production/service/IProductionService'
import NoteService from './feature/notes/service/NoteService'
import type INoteService from './feature/notes/service/INoteService'
import WeightService from './feature/animal/service/WeightService'
import type IWeightService from './feature/animal/service/IWeightService'
import ProfileService from './feature/profile/service/ProfileService'
import type IProfileService from './feature/profile/service/IProfileService'
import AnimalTypeService from './feature/customization/service/AnimalTypeService'
import type IAnimalTypeService from './feature/customization/service/IAnimalTypeService'
import SubscriptionService from './feature/subscription/service/SubscriptionService'
import type ISubscriptionService from './feature/subscription/service/ISubscriptionService'
import RevenueCatInAppPurchases from './library/purchases/revenuecat/RevenueCatInAppPurchases'

const firebaseAuth = new FirebaseAuth()
const revenueCat = new RevenueCatInAppPurchases()

export const bsFirebaseAuth = firebaseAuth
export const bsAuthService: IAuthService = new AuthService(firebaseAuth)
export const bsUserService: IUserService = new UserService()
export const bsHomesteadService: IHomesteadService = new HomesteadService()
export const bsAnimalService: IAnimalService = new AnimalService()
export const bsCareService: ICareService = new CareService()
export const bsHealthService: IHealthService = new HealthService(bsCareService)
export const bsBreedingService: IBreedingService = new BreedingService()
export const bsProductionService: IProductionService = new ProductionService()
export const bsNoteService: INoteService = new NoteService()
export const bsWeightService: IWeightService = new WeightService()
export const bsProfileService: IProfileService = new ProfileService()
export const bsAnimalTypeService: IAnimalTypeService = new AnimalTypeService()
export const bsSubscriptionService: ISubscriptionService = new SubscriptionService(revenueCat)
