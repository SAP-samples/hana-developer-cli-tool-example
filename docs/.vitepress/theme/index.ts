import { h } from 'vue'
import Theme from 'vitepress/theme'
import './style.css'

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // We can add custom slots here if needed
    })
  }
}
