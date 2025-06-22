// pages/_app.js
import '../styles/LayerToggle.css'
import '../styles/Legend.css'
import '../styles/StoryMode.css'

// If you have any other global styles (e.g. reset) import them here too:
// import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
}
