// pages/index.jsx
import dynamic from "next/dynamic";
import Head from "next/head";

// load your MapView _only_ on the client
const MapView = dynamic(() => import("../src/components/MapView"), {
    ssr: false,
});

export default function Home() {
    return (
        <>
            <Head>
                <title>Langley Museum Map</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <MapView />
        </>
    );
}
