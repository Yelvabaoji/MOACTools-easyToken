<template>
  <q-page padding>
    <h6>Vue-Social-Share</h6>
    <h6>A Vue 2.x social share component </h6>
    <github-badge slug="sinchang/vue-social-share" />
    <share :config="config"></share>

  </q-page>
</template>

<style>
</style>

<script>
import SocialShare from 'vue-social-share'
import GitHubBadge from 'vue-github-badge'
import 'vue-social-share/dist/client.css'

export default {
  data () {
    return {
      config: {
        url: 'www.baidu.com', // 网址，默认使用 window.location.href
        source: 'www.baidu.com', // 来源（QQ空间会用到）, 默认读取head标签：<meta name="site" content="http://overtrue" />
        title: 'www.baidu.com', // 标题，默认读取 document.title 或者 <meta name="title" content="share.js" />
        description: '我的分享', // 描述, 默认读取head标签：<meta name="description" content="PHP弱类型的实现原理分析" />
        image: 'app-logo-128x128.png', // 图片, 默认取网页中第一个img标签
        sites: ['qzone', 'qq', 'weibo', 'wechat', 'douban', 'google', 'facebook', 'twitter'], // 启用的站点
        // disabled: ['twitter'], // 禁用的站点
        wechatQrcodeTitle: '微信扫一扫：分享', // 微信二维码提示文字
        wechatQrcodeHelper: '<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>'
      }
    }
  },
  methods: {
  },
  components: {
    'share': SocialShare,
    'github-badge': GitHubBadge
  }
}
</script>
