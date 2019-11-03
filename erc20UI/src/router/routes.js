import MyLayout from 'layouts/MyLayout.vue'
// import PublicKey from 'pages/PublicKey.vue'
import CoinList from 'pages/CoinList.vue'
import ERC20 from 'pages/ERC20.vue'
import SocialShare from 'pages/Share'
import SocialSharing from 'pages/Sharing'

const routes = [
  {
    path: '/',
    component: MyLayout,
    children: [
      // { path: '', component: PublicKey },
      { path: 'coinlist', component: CoinList, name: 'coinlist' },
      { path: '/', component: ERC20, name: 'erc20' },
      { path: 'erc20', component: ERC20, name: 'erc20' },
      { path: 'socialshare', component: SocialShare, name: 'socialshare' },
      { path: 'socialsharing', component: SocialSharing, name: 'socialsharing' }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
