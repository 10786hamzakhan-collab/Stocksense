/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as ResetPasswordRouteImport } from './routes/reset-password'
import { Route as AuthenticatedRouteImport } from './routes/_authenticated/route'
import { Route as DashboardRouteImport } from './routes/_authenticated/dashboard'
import { Route as ProductsRouteImport } from './routes/_authenticated/products'
import { Route as ReceiptsRouteImport } from './routes/_authenticated/receipts'
import { Route as DeliveriesRouteImport } from './routes/_authenticated/deliveries'
import { Route as TransfersRouteImport } from './routes/_authenticated/transfers'
import { Route as AdjustmentsRouteImport } from './routes/_authenticated/adjustments'
import { Route as LedgerRouteImport } from './routes/_authenticated/ledger'
import { Route as WarehousesRouteImport } from './routes/_authenticated/warehouses'
import { Route as ProfileRouteImport } from './routes/_authenticated/profile'

const IndexRoute = IndexRouteImport.update({id:'/',path:'/',getParentRoute:()=>rootRouteImport} as any)
const AuthRoute = AuthRouteImport.update({id:'/auth',path:'/auth',getParentRoute:()=>rootRouteImport} as any)
const ResetPasswordRoute = ResetPasswordRouteImport.update({id:'/reset-password',path:'/reset-password',getParentRoute:()=>rootRouteImport} as any)
const AuthenticatedRoute = AuthenticatedRouteImport.update({id:'/_authenticated',getParentRoute:()=>rootRouteImport} as any)
const DashboardRoute = DashboardRouteImport.update({id:'/dashboard',path:'/dashboard',getParentRoute:()=>AuthenticatedRoute} as any)
const ProductsRoute = ProductsRouteImport.update({id:'/products',path:'/products',getParentRoute:()=>AuthenticatedRoute} as any)
const ReceiptsRoute = ReceiptsRouteImport.update({id:'/receipts',path:'/receipts',getParentRoute:()=>AuthenticatedRoute} as any)
const DeliveriesRoute = DeliveriesRouteImport.update({id:'/deliveries',path:'/deliveries',getParentRoute:()=>AuthenticatedRoute} as any)
const TransfersRoute = TransfersRouteImport.update({id:'/transfers',path:'/transfers',getParentRoute:()=>AuthenticatedRoute} as any)
const AdjustmentsRoute = AdjustmentsRouteImport.update({id:'/adjustments',path:'/adjustments',getParentRoute:()=>AuthenticatedRoute} as any)
const LedgerRoute = LedgerRouteImport.update({id:'/ledger',path:'/ledger',getParentRoute:()=>AuthenticatedRoute} as any)
const WarehousesRoute = WarehousesRouteImport.update({id:'/warehouses',path:'/warehouses',getParentRoute:()=>AuthenticatedRoute} as any)
const ProfileRoute = ProfileRouteImport.update({id:'/profile',path:'/profile',getParentRoute:()=>AuthenticatedRoute} as any)

export interface FileRoutesByFullPath { '/':typeof IndexRoute; '/auth':typeof AuthRoute; '/reset-password':typeof ResetPasswordRoute; '/dashboard':typeof DashboardRoute; '/products':typeof ProductsRoute; '/receipts':typeof ReceiptsRoute; '/deliveries':typeof DeliveriesRoute; '/transfers':typeof TransfersRoute; '/adjustments':typeof AdjustmentsRoute; '/ledger':typeof LedgerRoute; '/warehouses':typeof WarehousesRoute; '/profile':typeof ProfileRoute }
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRouteTypes { fileRoutesByFullPath:FileRoutesByFullPath; fullPaths:keyof FileRoutesByFullPath; fileRoutesByTo:FileRoutesByTo; to:keyof FileRoutesByFullPath; id:string; fileRoutesById:Record<string,any> }

declare module '@tanstack/react-router' { interface FileRoutesByPath {
 '/':{id:'/';path:'/';fullPath:'/';preLoaderRoute:typeof IndexRouteImport;parentRoute:typeof rootRouteImport}
 '/auth':{id:'/auth';path:'/auth';fullPath:'/auth';preLoaderRoute:typeof AuthRouteImport;parentRoute:typeof rootRouteImport}
 '/reset-password':{id:'/reset-password';path:'/reset-password';fullPath:'/reset-password';preLoaderRoute:typeof ResetPasswordRouteImport;parentRoute:typeof rootRouteImport}
 '/_authenticated':{id:'/_authenticated';path:'';fullPath:'';preLoaderRoute:typeof AuthenticatedRouteImport;parentRoute:typeof rootRouteImport}
 '/_authenticated/dashboard':{id:'/_authenticated/dashboard';path:'/dashboard';fullPath:'/dashboard';preLoaderRoute:typeof DashboardRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/products':{id:'/_authenticated/products';path:'/products';fullPath:'/products';preLoaderRoute:typeof ProductsRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/receipts':{id:'/_authenticated/receipts';path:'/receipts';fullPath:'/receipts';preLoaderRoute:typeof ReceiptsRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/deliveries':{id:'/_authenticated/deliveries';path:'/deliveries';fullPath:'/deliveries';preLoaderRoute:typeof DeliveriesRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/transfers':{id:'/_authenticated/transfers';path:'/transfers';fullPath:'/transfers';preLoaderRoute:typeof TransfersRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/adjustments':{id:'/_authenticated/adjustments';path:'/adjustments';fullPath:'/adjustments';preLoaderRoute:typeof AdjustmentsRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/ledger':{id:'/_authenticated/ledger';path:'/ledger';fullPath:'/ledger';preLoaderRoute:typeof LedgerRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/warehouses':{id:'/_authenticated/warehouses';path:'/warehouses';fullPath:'/warehouses';preLoaderRoute:typeof WarehousesRouteImport;parentRoute:typeof AuthenticatedRouteImport}
 '/_authenticated/profile':{id:'/_authenticated/profile';path:'/profile';fullPath:'/profile';preLoaderRoute:typeof ProfileRouteImport;parentRoute:typeof AuthenticatedRouteImport}
} }

const authenticatedChildren = { DashboardRoute, ProductsRoute, ReceiptsRoute, DeliveriesRoute, TransfersRoute, AdjustmentsRoute, LedgerRoute, WarehousesRoute, ProfileRoute }
const AuthenticatedRouteWithChildren = (AuthenticatedRoute as any)._addFileChildren(authenticatedChildren)
const rootRouteChildren = { IndexRoute, AuthRoute, ResetPasswordRoute, AuthenticatedRoute: AuthenticatedRouteWithChildren }
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
