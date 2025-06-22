import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.SerializedName;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class TribalGeoJsonGenerator {

    /**
     * Main method to generate the GeoJSON file.
     * It parses the raw data, creates feature objects for each tribe,
     * wraps them in a FeatureCollection, and writes the result to a file.
     *
     * @param args Command line arguments (not used).
     */
    public static void main(String[] args) {
        // NOTE: You will need to add the Google Gson library to your project.
        // If you are using Maven, add this to your pom.xml:
        // <dependency>
        //     <groupId>com.google.code.gson</groupId>
        //     <artifactId>gson</artifactId>
        //     <version>2.10.1</version>
        // </dependency>

        List<Feature> features = new ArrayList<>();
        // Split the entire data block into individual records for each tribe.
        // Each tribe's data is separated by two newlines followed by a name starting with a capital letter.
        String[] tribalDataBlocks = RAW_TRIBAL_DATA.trim().split("\n\n(?=[A-Z])");

        for (String block : tribalDataBlocks) {
            if (block.trim().isEmpty()) continue;

            String[] lines = block.trim().split("\n");
            String tribeName = lines[0].trim();

            // Skip the tribe name and the header line of the asset table.
            List<String> assetLines = Arrays.stream(lines)
                    .skip(2)
                    .filter(line -> !line.trim().isEmpty())
                    .collect(Collectors.toList());

            List<TribalAsset> tribalAssets = new ArrayList<>();
            for(String assetLine : assetLines) {
                // Split the line into 3 parts: Type, Description, and URL.
                // This is more robust than a simple split, as descriptions can contain commas.
                String[] parts = assetLine.split(",", 3);
                if(parts.length >= 3) {
                    String type = parts[0].trim();
                    // Clean up the title/description by removing surrounding quotes.
                    String title = parts[1].replaceAll("^\"|\"$", "").trim();
                    String url = parts[2].trim();
                    tribalAssets.add(new TribalAsset(type, title, url));
                }
            }

            // Create the properties for the GeoJSON feature
            Properties properties = new Properties(
                    tribeName,
                    "Cultural assets and information for the " + tribeName + " tribe.",
                    "", // image placeholder
                    "", // audio placeholder
                    "", // video placeholder
                    "", // website placeholder
                    tribalAssets
            );

            // Get pre-defined coordinates for the tribe
            double[] coordinates = getCoordinatesForTribe(tribeName);
            Geometry geometry = new Geometry("Point", coordinates);

            features.add(new Feature("Feature", geometry, properties));
        }

        FeatureCollection featureCollection = new FeatureCollection("FeatureCollection", features);

        // Use Gson to convert the Java object to a JSON string
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonOutput = gson.toJson(featureCollection);

        // Write the output to a file
        try (FileWriter writer = new FileWriter("tribal-markers-geocoded.geojson")) {
            writer.write(jsonOutput);
            System.out.println("Successfully created tribal-markers-geocoded.geojson");
        } catch (IOException e) {
            System.err.println("An error occurred while writing the GeoJSON file.");
            e.printStackTrace();
        }
    }

    /**
     * Provides approximate geographic coordinates (longitude, latitude) for each tribe.
     * NOTE: These are for representational purposes only and generally point to
     * tribal headquarters or a central point in their historical lands.
     *
     * @param tribeName The name of the tribe.
     * @return A double array containing [longitude, latitude].
     */
    private static double[] getCoordinatesForTribe(String tribeName) {
        switch (tribeName.toLowerCase()) {
            case "abenaki": return new double[]{-72.5778, 44.2601}; // Vermont
            case "absaroka (crow)": return new double[]{-107.4582, 45.6025}; // Crow Agency, MT
            case "apache": return new double[]{-105.7917, 33.3444}; // Mescalero, NM
            case "arapaho": return new double[]{-108.7330, 43.1558}; // Wind River Reservation, WY
            case "blackfeet (siksikaitsitapi)": return new double[]{-112.9843, 48.5570}; // Browning, MT
            case "caddo": return new double[]{-98.3967, 35.3039}; // Binger, OK
            case "cherokee": return new double[]{-94.9727, 35.9151}; // Tahlequah, OK
            case "cheyenne": return new double[]{-106.6548, 45.7208}; // Lame Deer, MT
            case "chickasaw": return new double[]{-96.6783, 34.7745}; // Ada, OK
            case "comanche": return new double[]{-98.3917, 34.6067}; // Lawton, OK
            case "creek (muscogee)": return new double[]{-95.9730, 35.6159}; // Okmulgee, OK
            case "delaware (lenape)": return new double[]{-95.9344, 36.6517}; // Bartlesville, OK
            case "flathead (salish)": return new double[]{-114.1687, 47.4788}; // Pablo, MT
            case "hopi": return new double[]{-110.6391, 35.8239}; // Kykotsmovi Village, AZ
            case "iroquois (haudenosaunee)": return new double[]{-76.1474, 42.9893}; // Onondaga Reservation, NY
            case "kiowa": return new double[]{-98.4612, 35.1587}; // Carnegie, OK
            case "lakota (sioux)": return new double[]{-102.5532, 43.4300}; // Pine Ridge, SD
            case "navajo (diné)": return new double[]{-109.0449, 35.6728}; // Window Rock, AZ
            case "nez percé": return new double[]{-116.6343, 46.3479}; // Lapwai, ID
            case "pawnee": return new double[]{-96.8045, 36.3384}; // Pawnee, OK
            case "pomo": return new double[]{-123.2078, 39.1502}; // Ukiah, CA
            case "puebloan peoples": return new double[]{-106.6504, 35.0844}; // Albuquerque, NM
            case "seminole": return new double[]{-80.2423, 26.1154}; // Hollywood, FL
            case "shawnee": return new double[]{-96.9248, 35.3378}; // Shawnee, OK
            case "shoshone": return new double[]{-108.8832, 42.9958}; // Fort Washakie, WY
            case "sioux": return new double[]{-100.3464, 44.5245}; // South Dakota
            case "zuni": return new double[]{-108.8473, 35.0692}; // Zuni Pueblo, NM
            default: return new double[]{0, 0}; // Default case
        }
    }

    // Static raw data string copied from the provided document, using a text block.
    private static final String RAW_TRIBAL_DATA = """
    Abenaki

    Asset Type,Description,Source / Link
    Image,"Painting: '18th Century Abenaki Couple' by Francine Poitras Jones, depicting post-contact clothing with wool, linen, and trade goods.",https://hidden.coplacdigital.org/afualor/wp-content/uploads/sites/18/2018/10/18th-Century-Abenaki-Couple-by-Francine-Poitras-Jones-Nulhegan-Abenaki-1-1024x768.jpg
    Image,"Replica of an archaic style dress made from milkweed plant fiber, representing pre-contact attire. Made by Vera Walker Sheehan.",https://hidden.coplacdigital.org/afualor/wp-content/uploads/sites/18/2018/10/Archaic-Style-Dress-by-Vera-Walker-Sheehan-1-768x1024.jpg
    Image,Hand-woven milkweed fiber satchel used for collecting plants and seeds. Made by Vera Walker Sheehan.,https://hidden.coplacdigital.org/afualor/wp-content/uploads/sites/18/2018/10/Twined-Bag-by-Vera-Walker-Sheehan-1-768x1024.jpg
    Image,"Abenaki women's headgear made of French lace, ribbon, and beads in the curved motif of the Wabanaki Confederacy. Made by Lori Lambert.",https://hidden.coplacdigital.org/afualor/wp-content/uploads/sites/18/2018/10/Womens-Headgear-by-Lori-Lambert-1-768x1024.jpg
    Image,"Gourd art by Jeanne Morningstar Kent telling the traditional stories of 'Gluscape Fights the Water Serpent' and 'How Woodpecker Got His Red Head.'",https://abenaki-edu.org/wp-content/uploads/2021/04/Gourd-Art-by-Jeanne-Morningstar-Kent-scaled.jpg
    Image,"Photos from crafting and music classes, fundraisers, and community gatherings.",https://abenakination.com/news-%26-events
    Audio,"Language and cultural recordings, including the Paul Thompson fonds and Bernard Assiniwi fonds.",https://recherche-research.bac-lac.gc.ca/eng/public/list/46319
    Audio,Music featuring traditional instruments like drums and rattles made from wood and rawhide.,https://moose.nhhistory.org/Moose/media/Default/Documents%20and%20PDFs/Unit-2-docs/U2-Music-and-Dances.pdf
    Video,"Documentary: Waban-Aki: People from Where the Sun Rises (2006), a feature-length film by Abenaki filmmaker Alanis Obomsawin.",https://www.tenk.ca/en/documentaires/the-films-of-alanis-obomsawin/waban-aki-people-from-where-the-sun-rises
    Video,Documentary: The Abenaki of New Hampshire,https://www.youtube.com/watch?v=cGwcGQpL5PM
    Video,"Lecture: 'Abenaki History In Vermont' by Dr. Frederick M. Wiseman, covering 12,000 years of history.",https://abenaki-edu.org/abenaki-history-in-vermont/
    Video,"News Clip: 'Vermont House Approves Apology for Eugenics Program,' covering the official apology for the state's 20th-century eugenics program.",https://abenaki-edu.org/vermont-house-approves-apology-for-eugenics-program/
    Video,"Cultural Demonstration: 'Virtual Abenaki Heritage Weekend: Abenaki Basket Makers' featuring Sherry Gould.",https://abenaki-edu.org/virtual-abenaki-heritage-weekend-abenaki-basket-makers/
    Document,PDF on Abenaki Music and Dances.,https://moose.nhhistory.org/Moose/media/Default/Documents%20and%20PDFs/Unit-2-docs/U2-Music-and-Dances.pdf
    Document,PDF on Abenaki Oral Tradition.,https://moose.nhhistory.org/Moose/media/Default/Documents%20and%20PDFs/Unit-2-docs/U2_L3_EG.pdf

    Absaroka (Crow)

    Asset Type,Description,Source / Link
    Image,"Painting: 'Distinguished Crow Indians' by George Catlin (1861/1869), oil on card mounted on paperboard.",https://www.nga.gov/artworks/50328-distinguished-crow-indians
    Image,"Painting: 'A Child of the Plains, Absaroka Indian' by John Young-Hunter (1914), tempera on canvas.",https://collections.starkculturalvenues.org/objects/40063/a-child-of-the-plains-absaroka-indian
    Image,"Painting: 'Knows Her Medicine Crow Indian' by contemporary Apsáalooke artist Kevin Red Star.",https://www.denverartmuseum.org/en/edu/object/knows-her-medicine-crow-indian
    Image,"Photograph of a Crow woman's dress decorated with imitation imitation elk teeth, made of red stroud cloth.",https://www.penn.museum/collections/object/2324
    Image,"Framed Canvas Print: 'Absaroka Mountains' by Kelsey Shields.",https://www.kelseyshieldsart.com/product-page/absaroka-mountains-framed-canvas-print-1
    Audio,"Album: 'Crow Tribal Sundance Songs,' featuring 14 songs by Pete Whiteman and Milton Yellow Mule.",https://indianhouse.com/products/crow-tribal-sundance-songs
    Audio,"Music for the Crow-Hop dance, a social dance said to have originated with the Crow Nation.",https://www.bellisario.psu.edu/powwow/songs-and-dances
    Audio,Recordings of the Absaroka language spoken in conversation.,https://www.youtube.com/watch?v=xHQKFgYEw3w
    Video,"Documentary: Crow Country: Our Right to Food Sovereignty, directed by Tsanavi Spoonhunter.",https://www.crowcountrydoc.com/
    Video,"Documentary: Contrary Warriors: A Story of the Crow Tribe, co-produced by Pamela Roberts.",https://itvs.org/films/contrary-warriors
    Video,Documentary short about the Crow people and their connection to their land.,https://www.youtube.com/watch?v=fJ32VSTO8fs
    Document,PDF of the Crow Reservation Timeline.,https://opi.mt.gov/Portals/182/Page%20Files/Indian%20Education/Social%20Studies/K-12%20Resources/Crow%20Timeline.pdf

    Apache

    Asset Type,Description,Source / Link
    Image,"Historical portraits of leaders Geronimo, Mangas Coloradas, and Victorio.",https://mescaleroapachetribe.com/our-culture/
    Image,Photographs by Edward S. Curtis depicting Apache individuals and traditional dress.,https://edwardcurtisphotos.com/store/apache-native-american-photos/
    Image,"Examples of Apache basketry, including the large, pine-pitch-coated Tus basket for carrying water.",https://scalar.usc.edu/works/american-indian-film-archive/apache-arts-and-crafts
    Image,Sculptures by Chiricahua Apache artist Bob Haozous and Gaan Dancer carvings by Hopi artist Vincent Dawahongva.,https://www.adobegallery.com/origin/Apache/
    Audio,"Western Apache Audio Bible, including the full New Testament and hymns.",https://todaysnative.org/native-language-audio-bible/apache-audio-bible/
    Audio,Audio recordings of Bible stories and evangelistic messages in the Apache: San Carlos dialect.,https://globalrecordings.net/en/language/336
    Audio,"Music for the Gaan Dance (Crown Dance), a ceremonial performance where dancers impersonate Mountain Spirits.",https://drumhop.com/music.php?page=128
    Video,"Documentary: Unconquered: Allan Houser and the Legacy of One Apache Family, about the life and work of the Chiricahua Apache sculptor.",https://www.youtube.com/watch?v=KN9SifI6xbs
    Video,Jesus Film dubbed into the Western Apache language.,https://todaysnative.org/native-language-audio-bible/apache-audio-bible/
    Video,"Educational multimedia package for students, including images, videos, and audio narration about Apache culture.",https://www.classroomnook.com/shop/p/native-american-tribes-apache
    Document,"PDF of 'Apache Warriors Tell Their Side (to Eve Ball)'.",https://www.oldpueblo.org/wp-content/uploads/2022/02/202109opa86_-ApacheWarriorsTellTheirSideToEveBall.pdf

    Arapaho

    Asset Type,Description,Source / Link
    Image,Ledger art by Frank Henderson depicting warrior society dances and battle exploits.,https://www.metmuseum.org/art/collection/search/679641
    Image,"Collection of 19th-century Arapaho artifacts including moccasins, pipe bags, and robes.",https://www.metmuseum.org/art/collection/search?q=Arapaho&sortBy=Relevance
    Image,"Collection of Arapaho art including a girl's turtle amulet, pipe bags, and moccasins.",http://portlandartmuseum.us/mwebcgi/mweb.exe?request=record;id=300017634;type=801
    Image,"Photographs of Arapaho individuals, 'The Old Warrior' and 'Black Man,' by Edward Sheriff Curtis.",http://portlandartmuseum.us/mwebcgi/mweb.exe?request=record;id=300017634;type=801
    Audio,"Digitized sound recordings of the Arapaho language, including grammar, vocabularies, and oral narratives.",https://indigenousguide.amphilsoc.org/search?f%5B0%5D=guide_culture_content_title%3AArapaho&f%5B1%5D=guide_subject_content_title%3ALinguistics&f%5B2%5D=guide_type_content_title%3ASound%20recording
    Audio,"Recordings of 'Words of Life,' including Bible stories and hymns in Northern and Southern Arapaho dialects.",https://todaysnative.org/native-language-audio-bible/arapaho-resources/
    Audio,Recordings of Ghost Dance-era songs associated with the Arapaho Crow Dance.,https://indigenousguide.amphilsoc.org/entry/10170
    Video,"Documentary: We Are the Arapaho People, examining the history, culture, and identity of the Northern Arapaho.",https://www.arapahotruths.com/we-are-the-arapaho-people
    Video,"Educational Video: Who are the Northern Arapaho?, providing an overview of the tribe's history and their arrival in Wyoming.",https://www.pbslearningmedia.org/resource/who-are-the-northern-arapaho-video/wyomings-native-americans/
    Video,Documentary: History of the Arapaho Tribe,https://www.youtube.com/watch?v=CvudQYuvmUw
    Video,Documentary: Native Heritage - Northern Arapaho,https://www.youtube.com/watch?v=jzsP3Px1uPg
    Document,Oral history narrative from an unidentified Arapaho woman recorded in 1972.,https://www.nativeoralhistory.org/digital-heritage/narrative-arapaho-woman
    Document,Oral histories of the Sand Creek Massacre from the perspective of Cheyenne and Arapaho elders.,https://www.historycolorado.org/lost-highways/2024/04/17/oral-histories-sand-creek-massacre-cheyenne-and-arapaho-tribes-located

    Blackfeet (Siksikaitsitapi)

    Asset Type,Description,Source / Link
    Image,"Man's shirt (c. 1880) made of red wool trade cloth, with weasel-fur fringe and beaded rosettes.",https://www.metmuseum.org/art/collection/search/642585
    Image,"Hide painting of 'White Quiver,' a renowned Blackfeet horse thief, by contemporary artist David Dragonfly.",https://iacbmuseums-viewingroom.exhibit-e.art/viewing-room/david-dragonfly/works/10976
    Image,"Linocut print 'Blackfeet Homeland' by David Dragonfly, depicting tipis, horses, and the Rocky Mountains.",https://iacbmuseums-viewingroom.exhibit-e.art/viewing-room/david-dragonfly/works/10975
    Image,Portraits of Blackfeet individuals by artist Winold Reiss.,https://iacbmuseums-viewingroom.exhibit-e.art/viewing-room/connections-the-blackfeet-and-winold-reiss
    Audio,Audio recordings of the Gospels of John and Acts in the Blackfoot language.,https://todaysnative.org/native-language-audio-bible/blackfoot-audio-bible/
    Audio,Audio Bible stories and evangelistic messages in Blackfoot.,https://globalrecordings.net/en/language/bla
    Audio,"Traditional music, including the 'Blackfoot Theme Song' and 'Feather Belt Dance.'",https://drumhop.com/music.php?page=268
    Audio,Interviews discussing the preservation of ceremonial songs and modern drum groups.,https://lewis-clark.org/arts/song-and-dance/blackfeet-songs/
    Video,"Documentary: Backbone of the World: The Blackfeet (1998), about the tribe's struggle to protect their sacred Badger-Two Medicine area.",https://itvs.org/films/backbone-of-the-world/
    Video,"Documentary: Bring Them Home (2024), narrated by Lily Gladstone, about the mission to establish a wild buffalo herd on ancestral territory.",https://www.thunderheartfilms.com/bring-them-home
    Video,"Documentary: A Blackfeet Encounter (2007), exploring the history of the only deadly clash between the Blackfeet and the Lewis and Clark Expedition.",https://visionmakermedia.org/product/a_blackfeet-encounter/
    Document,PDF of Blackfoot Creation Stories.,https://blackfootconfederacy.ca/wp-content/uploads/2024/04/Creation-Stories.pdf
    Document,"PDF of 'A Literary Analysis of Blackfoot Oral Stories'.",https://opus.uleth.ca/bitstreams/935c267a-e11f-46ad-8912-d8fe7ec46765/download

    Caddo

    Asset Type,Description,Source / Link
    Image,"Caddo pottery, including carinated bowls and long-necked bottles with intricate engraved designs.",https://www.texasbeyondhistory.net/tejas/clay/tradition.html
    Image,Contemporary Caddo pottery by artist Jeri Redcorn.,https://www.thestoryoftexas.com/upload/files/american-indian-heritage/Coil_Pot_Activity_AIHD-2020.pdf
    Image,"Contemporary Caddo regalia, including a ribbon shirt and a woman's headdress.",https://caddoheritage.wordpress.com/culture/
    Audio,"Linguistic field recordings of the Caddo language from 1956, including vocabulary, stories, and prayers.",https://cla.berkeley.edu/collection/?collid=10163=The%20Daniel%20DaCruz%20collection%20of%20Caddo%20sound%20recordings
    Audio,"Traditional Caddo songs, including lullabies, victory songs, and the 'Song of the Little Skunk's Dream,' performed by elder Stanley Edge.",https://drumhop.com/music.php?page=136
    Video,"Documentary: Caddo Voices: A Basketry Revival, following modern Caddo people as they work to restore the tradition of river cane basketry.",https://www.pbs.org/video/caddo-voices-a-basketry-retrieval-coesgt/
    Video,TV spots produced by the Caddo Nation's Media and Marketing Department.,https://mycaddonation.com/
    Document,"PDF of 'The Caddo Indians of Louisiana'.",https://www.crt.state.la.us/Assets/OCD/archaeology/discoverarchaeology/virtual-books/PDFs/Caddo.pdf

    Cherokee

    Asset Type,Description,Source / Link
    Image,"Traditional Cherokee arts and crafts including basketry, pottery, and carving.",https://quallaartsandcrafts.org/
    Image,"Modern 'tear dress' worn by women and ribbon shirts worn by men for special occasions.",https://www.cherokee.org/about-the-nation/frequently-asked-questions/culture/
    Image,Downloadable Christmas coloring pages featuring Cherokee designs.,https://www.cherokee.org/media/mkko10yo/2023-christmas-ornament-coloring.pdf
    Audio,Audio recording of the entire Gospel of John in the Cherokee language.,https://todaysnative.org/native-language-audio-bible/cherokee-audio-resources/
    Audio,Compilation of hymns sung by the Cherokee National Youth Choir.,https://todaysnative.org/native-language-audio-bible/cherokee-audio-resources/
    Audio,"Cherokee Voices, Cherokee Sounds radio program.",https://www.cherokee.org/cherokee-voices-cherokee-sounds
    Video,"Documentary: By Blood (2016), chronicling the conflict over tribal rights between the Cherokee Nation and the Cherokee Freedmen.",https://www.amdoc.org/watch/blood/
    Video,"Documentary: Indigenous People of the Americas: Cherokee (2020), providing a historical overview of the tribe.",https://www.youtube.com/watch?v=f9fSCbL4mk8
    Video,"OsiyoTV, a television program dedicated to sharing the stories, language, and culture of the Cherokee people.",http://osiyo.tv/
    Document,PDF of Christmas Coloring Sheets.,https://www.cherokee.org/media/ljqly2xm/coloringsheets-2022-christmas.pdf

    Cheyenne

    Asset Type,Description,Source / Link
    Image,Painted tipi curtain from the Elkhorn Scraper Warrior Society and a painted robe with a sunburst design (c. 1850-1870).,https://www.artic.edu/artworks/100658/painted-tipi-curtain-victory-record-of-the-elkhorn-scraper-warrior-society
    Image,Historical photographs by Edward S. Curtis depicting Cheyenne individuals and clothing.,https://edwardcurtisphotos.com/store/cheyenne-native-american-photos/
    Audio,"Audio course: Let's Talk Cheyenne, an introductory course with audio files recorded by elder Ted Risingsun.",https://www.cheyennelanguage.org/letstalk.htm
    Video,"Documentaries produced by the Cheyenne River Youth Project, such as Wakanyeja Kin Wana Ku Pi (The Children are Coming Home).",https://lakotayouth.org/about/documentaries/
    Video,"Programming from Cheyenne and Arapaho Productions (CAP), a public broadcast TV station.",https://www.catv35.com/
    Document,"PDF of 'Let's Talk Cheyenne' course booklet.",https://www.cheyennelanguage.org/letstalk.htm

    Chickasaw

    Asset Type,Description,Source / Link
    Image,Bronze statue by James Blackburn depicting traditional Chickasaw hunters.,https://www.chickasawculturalcenter.com/explore/statues-sculptures/
    Image,Sculptures by Chickasaw artist Joanna Underwood representing designs from early pottery and shell carvings.,https://www.chickasawculturalcenter.com/explore/statues-sculptures/
    Audio,Language recordings of Chickasaw words for local plants and animals.,http://www.wolfgaptn.com/qr-12
    Audio,Audio news releases from the Chickasaw Nation Media Relations department.,https://chickasaw.net/News/Media-Room
    Audio,Stomp dance songs and songs for social dances like the Gar Fish Dance and Snake Dance.,https://www.chickasaw.net/Our-Nation/Culture/Society/Social-Dances.aspx
    Video,"Documentary: First Encounter, chronicling the tribe's first contact with the Hernando de Soto expedition in 1540.",https://chickasawfilms.com/Projects/Documentaries
    Video,"Documentary: Bearer of the Morning, about the life of the famed Chickasaw performer and storyteller Te Ata.",https://chickasawfilms.com/Projects/Documentaries
    Video,"Documentary: Montford Johnson: An Original Brand, telling the story of the successful 19th-century Chickasaw cattleman.",https://chickasawfilms.com/Projects/Documentaries
    Video,Language learning videos and traditional stories told in the Chickasaw language.,https://www.chickasaw.tv/language
    Video,"Cultural presentations on clothing, food, games, and the creation of regalia.",https://chickasaw.net/Our-Nation/Culture/Multimedia

    Comanche

    Asset Type,Description,Source / Link
    Image,"Painting: 'The Buffalo Chase' by George Catlin.",https://www.tshaonline.org/handbook/entries/comanche-indians
    Image,"Painting: 'Comanches of West Texas in War Regalia' (1830s) by Lino Sánchez y Tapia.",https://www.tshaonline.org/handbook/entries/comanche-indians
    Image,"Collection of Comanche art including a parfleche flat case, a bridle, and woman's boots from the mid-19th century.",https://www.metmuseum.org/art/collection/search?q=Comanche&sortBy=Relevance
    Audio,"Audio recordings of 'Words of Life,' including Bible stories and evangelistic messages in the Comanche language.",https://globalrecordings.net/en/language/com
    Audio,"Album: 'Comanche Tribal Chants,' featuring war dances, sneak dances, and flag songs.",https://music.apple.com/us/artist/comanche-tribal-chants/536947003
    Audio,"Podcast: Nʉmʉ Tekwarʉ: The Comanche Talk Podcast, a bi-weekly podcast produced by the Comanche Nation.",https://www.comanchenation.com/communications/page/meet-team
    Video,"Documentary: Quanah Parker: The Last Comanche, a chronicle of the last Comanche leader.",https://tv.apple.com/us/episode/quanah-parker-the-last-comanche/umc.cmc.52pwsa7omxc1plpf3coar3w6o
    Video,"Documentary: 'Comanche Academy: A Healing Journey', exploring healing from the trauma of Indian boarding schools.",https://www.comanchenation.com/culture/page/comanche-academy-healing-journey-premieres-lawton
    Video,Video news segments and footage of events produced by the Comanche Nation Public Information Office.,https://www.youtube.com/channel/UCQ8a5K9b3iJ22xY6p-wE1-Q
    Document,PDF of the Comanche Nation Research Report.,https://ftp.txdot.gov/pub/txdot-info/env/toolkit/415-03-rpt.pdf

    Creek (Muscogee)

    Asset Type,Description,Source / Link
    Image,"Painting of Tchow-ee-put-o-kaw, a Creek woman in traditional fringed skin garments, by George Catlin (1836).",https://homepages.rootsweb.com/~cmamcrk4/crk5.html
    Image,"Muscogee shell carving by artist Chris Thompson, depicting figures like Grandmother Weaver.",https://blog.wfsu.org/blog-coastal-health/2018/01/exploring-muscogee-culture-shell-carving/
    Image,Collection of Muscogee/Creek art including a shoulder bag and moccasins from the 1830s.,https://www.metmuseum.org/art/collection/search?q=Muscogee%2F+Creek%2C+Native+American&sortBy=Relevance
    Audio,"Mvskoke Language Program audio links for 1st, 2nd, and 3rd level language learners.",https://www.muscogeenation.com/department-of-education-and-training/mvskoke-language-program/
    Video,"Documentary: The Forgotten Creeks, an Emmy Award-winning film about the history of the Poarch Creek Indians.",https://pci-nsn.gov/our-story/the-forgotten-creeks/
    Video,News videos and press conferences regarding the protection of the sacred Hickory Ground.,https://www.muscogeenation.com/justice-for-hickory-ground/hickory-ground-media/
    Document,"PDF of Mvskoke Media's newspaper, Mvskoke News.",https://www.mvskokemedia.com/about/

    Delaware (Lenape)

    Asset Type,Description,Source / Link
    Image,"Artwork by Lenape artists from 1920 to the present, including paintings by Jacob Parks and Ruthe Blalock Jones.",https://delawaretribe.org/wp-content/uploads/Artwork-by-Lenape-Artists.pdf
    Image,"Delaware bandolier bag decorated with glass seed-bead embroidery in the 'Prairie style.'",https://americanindian.si.edu/exhibitions/infinityofnations/woodlands/213358.html
    Audio,"The Lenape Talking Dictionary, containing over 15,000 words, with sound files for nearly 6,350 words.",http://www.talk-lenape.org/
    Audio,Western Delaware language program consisting of a workbook and three audio tapes with a 200-word glossary.,https://shop.multilingualbooks.com/products/western-delaware-cassette-program
    Audio,"Music for social dances like the Stomp Dance, Bean Dance, and Raccoon Dance, featuring the water drum and various rattles.",https://delawaretribe.org/wp-content/uploads/Lenape-Dances.pdf
    Video,"Documentary: Drive By History: The Secret World of the Lenape, an investigation into the sophisticated civilization of the Lenape.",https://www.pbs.org/video/the-secret-world-of-the-lenape-and-truths-about-1770s-life-ks8nel/
    Video,"Language and culture videos, including 'Animals in Lenape and English' and 'How to Make Delaware Moccasins with Nora Thompson Dean.'",https://m.youtube.com/@delawaretribe-lenapecultur5135
    Document,"PDF of 'Lenape Dances'.",https://delawaretribe.org/wp-content/uploads/Lenape-Dances.pdf

    Flathead (Salish)

    Asset Type,Description,Source / Link
    Image,"Images of Salish and Dene clothing, including a general image and one related to weaving.",https://s3-us-west-2.amazonaws.com/tota-images/1639605703151-b7f5d4862a8ac2b4.png
    Image,"Artwork by Susan Point, a Coast Salish artist, including the red cedar sculpture Butterfly Whorl and the serigraph Manawanui.",https://vmfa.museum/learn/resources/art-making-activity-coast-salish-designs/
    Audio,"Audio recordings of Salish language, including pronunciation drills and vocabulary for animals, clothing, and plants.",http://salishaudio.org/audio/
    Audio,Audio recordings from the Confederated Salish and Kootenai Tribes' multimedia Climate Change Strategic Plan.,https://www.usetinc.org/community-resilience-archive/confederated-salish-and-kootenai-tribes-win-award-for-multimedia-climate-change-strategic-plan/
    Audio,"Pop songs by artist Salish Matter, including 'Shiping Us' and 'The Truth About Their Feelings.'",https://music.apple.com/us/artist/salish-matter/1583064213
    Video,"Documentary: Saving Salish, which documents the N'kwusm Salish language immersion school on the Flathead Indian Reservation.",https://www.pbs.org/show/saving-salish/
    Video,"Documentary: Beyond the Salish Sea, a film exploring the connection between place and environmental stewardship.",https://beyondthesalishsea.com/
    Video,"Recordings with Salish language or cultural content, including The Weavers of Musqueam and A Pair of Moccasins for Mary Thomas.",https://recherche-research.bac-lac.gc.ca/eng/public/list/46482

    Hopi

    Asset Type,Description,Source / Link
    Image,"Art from the Hopi Arts Trail, including pottery, Kachina Doll carving, basket weaving, and silversmithing.",https://hopiartstrail.com/
    Image,"Hopi art including jewelry, pottery, and Kachina carvings from the collection of Mr. and Mrs. Walt Martin.",https://lammuseum.wfu.edu/exhibits/virtual/living-arts-of-the-hopi/
    Image,Painting of a Hopi man in traditional wear.,https://scalar.usc.edu/works/american-indian-film-archive/hopi-clothing.4
    Audio,"Album: Hopi Tales, featuring spoken-word stories performed by actor Jack Moyles.",https://folkways.si.edu/jack-moyles/hopi-tales/american-indian-childrens-spoken-word/album/smithsonian
    Audio,"Music by the artist 'Hopi,' including 'Hopi Butterfly Song,' 'Hopi Lullaby,' and 'Hopi War Dance Song.'",https://music.apple.com/us/artist/hopi/1431050443
    Audio,"Audio recording and booklet: Hopilavayvenpi: The Hopi Alphabet in Conversation, teaching the 21 symbols of the Hopi alphabet.",https://mesamedia.org/store/Hopilavayvenpi-The-Hopi-Alphabet-in-Conversation-p438361986
    Video,"Documentary: The Hopi: Mesas, Native American Indian Documentary (1982), an in-depth look at seasonal rituals and Hopi culture.",https://www.ebay.com/itm/277079042802
    Video,"Documentary: Koyaanisqatsi (1982), a non-narrative film whose title is a Hopi word meaning 'life out of balance'.",https://en.wikipedia.org/wiki/Koyaanisqatsi
    Document,"PDF of 'Hopi Oral Traditions and the Archaeology of Identity'.",https://digitalcommons.unl.edu/tsaconf/1111/
    Document,"PDF of 'Prehistory and the Traditions of the O'Odham and Hopi'.",https://www.resolutionmineeis.us/sites/default/files/references/teague-1993.pdf

    Iroquois (Haudenosaunee)

    Asset Type,Description,Source / Link
    Image,"Contemporary Iroquois art including basketry, antler carving, painting, and stone sculpture.",https://www.iroquoismuseum.org/collections
    Image,"Sculpture: Iroquois (1983-1999) by Mark di Suvero, a 40-foot-high painted steel sculpture.",https://www.associationforpublicart.org/artwork/iroquois/
    Audio,"Recordings of Iroquois social songs, including 'Women's Rabbit Songs.'",https://recherche-research.bac-lac.gc.ca/eng/public/list/46458
    Audio,"Music for social dances, featuring instruments like the water drum and horn rattle.",https://en.wikipedia.org/wiki/Iroquois_music
    Video,"Documentary Series: The Iroquois, a four-part series exploring Iroquois culture.",https://www.pbs.org/show/wmht-specials/collections/iroquois/
    Video,"Documentary: Iroquois Indians: A Documentary History, digitized from microfilm.",https://archive.org/details/per_iroquois-indians-a-documentary-history_iroquoi_february-06-1797-may-25-1807_ia40607516-21
    Document,"PDF of 'Oral Tradition: The Word is King'.",https://societies.learnquebec.ca/societies/iroquois-around-1500/oral-tradition-the-word-is-king/

    Kiowa

    Asset Type,Description,Source / Link
    Image,"Watercolor paintings by the Kiowa Six, a collective of artists from the early 20th century, depicting ceremonial life.",https://www.nypl.org/events/exhibitions/galleries/fortitude/item/10088
    Image,Cradleboard by artist Paukeigope.,https://smarthistory.org/paukeigope-kiowa-cradleboard/
    Audio,"Album: Kiowa, featuring drumming and chanting by Kenneth Anquoe, including Flag Song, Gourd Dance, and War Dance songs.",https://folkways.si.edu/kenneth-anquoe/kiowa/american-indian/music/album/smithsonian
    Audio,"Recordings of 'Words of Life,' including Bible stories and evangelistic messages in the Kiowa language.",https://globalrecordings.net/en/language/kio
    Video,Documentary footage of Kiowa people.,https://www.youtube.com/watch?v=wcqflbbDIFo
    Video,Documentary about the Kiowa leader Satanta.,https://www.youtube.com/watch?v=8k3cRXBVGg4
    Document,Oral History: Myths and oral traditions telling of a northern home near the Rocky Mountains.,https://www.tshaonline.org/handbook/entries/kiowa-indians

    Lakota (Sioux)

    Asset Type,Description,Source / Link
    Image,"Black Bonnet War Robe (1963), a painted bison robe by Yanktonai Sioux artist Herman Red Elk.",https://www.doi.gov/iacb/TreasuresHerman
    Image,"Collection of Lakota/Teton Sioux art including a cradleboard, woman's dress, and tipi bag from the late 19th century.",https://www.metmuseum.org/art/collection/search?q=Lakota%2F+Teton+Sioux&sortBy=Relevance
    Audio,"Lakota Language Consortium audio series, a practical conversation course with multiple levels and units.",https://music.apple.com/us/artist/lakota-language-consortium/368331769
    Audio,"Lakota Horse Song, a traditional song performed at Wicoti Tiwahe—Family Camp.",https://www.sdpb.org/native-american-studies-multimedia/
    Video,"Documentary: Without Arrows, an intimate portrait of contemporary Lakota life.",https://www.pbs.org/independentlens/documentaries/without-arrows/
    Video,"The Lakota Berenstain Bears, a 20-episode cartoon series produced in the Lakota language.",https://www.sdpb.org/native-american-studies-multimedia/
    Document,"PDF of 'Lakota Oral Literature'.",https://files.eric.ed.gov/fulltext/ED141014.pdf

    Navajo (Diné)

    Asset Type,Description,Source / Link
    Image,"Navajo art including sand paintings, turquoise and silver jewelry, woven ceremonial baskets, and pottery.",https://www.invaluable.com/blog/navajo-art/
    Image,"Navajo Clan Wheel Chart, used to help students identify family relationships and connections.",http://navajopeople.org/
    Audio,"Audio course: Dine Bizaad: Speak, Read, Write Navajo, a set of 6 CDs with 5 hours of audio lessons.",https://salinabookshelf.com/products/dine-bizaad-speak-read-write-navajo-audio-set-lessons-1-30-cd
    Video,"Documentary: Jake Livingston – Navajo-Zuni Silversmith, containing stories from his life.",http://navajopeople.org/
    Video,"Documentary: Peter MacDonald Tribal Chairman & Code Talker, containing stories from his life.",http://navajopeople.org/
    Video,"Fictional Drama Film: Navajo (1952), which was nominated for a Best Documentary Feature Oscar.",https://en.wikipedia.org/wiki/Navajo_(film
    Document,"Oral History: Transcripts of recordings made with Navajo interviewees, documenting personal and family histories.",https://guides.library.yale.edu/c.php?g=1204136&p=8988902

    Nez Percé

    Asset Type,Description,Source / Link
    Image,"Traditional Nez Perce art, including geometric and floral patterns in decorations and beadwork.",https://www.fs.usda.gov/main/npnht/learningcenter/history-culture
    Audio,"Recording of Elizabeth Penney Wilson, a Nez Perce tribal member, singing a hymn in the nimipuutímt language.",https://www.nps.gov/media/sound/view.htm?id=07BF7DA3-BAE6-4F9C-99B4-D1B7AC48A631
    Video,"Documentary: Sacred Journey of the Nez Perce, chronicling the tribe's 1,600-mile journey during the Nez Perce War of 1877.",https://www.pbs.org/show/sacred-journey-nez-perce/
    Document,"Oral History: The Nimiipuu creation story, in which Coyote creates the various tribes from the pieces of a monster.",https://www.nps.gov/museum/exhibits/nepe/legend_times.html

    Pawnee

    Asset Type,Description,Source / Link
    Image,"Painting: 'Pawnee Indians' by George Catlin (1861/1869), depicting three warriors and a woman.",https://www.nga.gov/artworks/50368-pawnee-indians
    Image,Various paintings of Pawnee individuals and scenes by artists like Charles Bird King and George Catlin.,https://www.google.com/search?q=Pawnee+art&tbm=isch
    Audio,"Album: Music of the Pawnee, featuring 45 songs sung by Mark Evarts, recorded in 1936.",https://folkways.si.edu/mark-evarts/music-of-the-pawnee/american-indian/album/smithsonian
    Audio,"Pawnee Prayer Song, Hand Game Song, and Ghost Dance Song, recorded and edited by Willard Rhodes.",https://drumhop.com/music.php?page=138
    Audio,Multimedia language lessons on CD-ROM that incorporate recordings of a native speaker pronouncing Pawnee vocabulary and sentences.,https://aisri.indiana.edu/research/educational/pawnee.html
    Video,"Documentary: Pawnee Seed Warriors Revive Ancient Ties to Ancestors, following seed keepers working to regain food sovereignty.",https://www.rmpbs.org/shows/homegrown-documentary-shorts-collection/episodes/pawnee-seed-warriors-revive-ancient-ties-ancestors-vnnbq1
    Video,"Photodocumentary: Pawnee Bill's Historic Wild West, featuring 155 photographs from the 1900-1905 show tours.",https://www.amazon.com/Pawnee-Bills-Historic-Wild-West/dp/0887404375
    Document,"Oral History: Traditions that date back to the Ice-Age, potentially describing the Ice-Free Corridor.",https://crowcanyon.org/resources/western-pawneeland-oral-traditions-archaeology-and-euro-american-accounts-of-pawnees-in-the-front-range/

    Pomo

    Asset Type,Description,Source / Link
    Image,"Pomo basketry, considered among the finest in the world, using a wide variety of weaving techniques.",https://www.metmuseum.org/exhibitions/jules-tavernier/visiting-guide
    Image,"Photograph of a Pomoan woman with a child in a baby basket, c. 1892, by H.W. Henshaw.",https://www.slideshare.net/slideshow/native-american-people-pomo-indian-tribe/75111715
    Image,"Photograph of a Pomoan man with two basketry fish traps, c. 1892, by H.W. Henshaw.",https://www.slideshare.net/slideshow/native-american-people-pomo-indian-tribe/75111715
    Image,Image of a traditional Pomo dance outfit and a Native flute.,https://hermosillopomo.weebly.com/art-music-and-artifacts.html
    Audio,"Music for Pomo dances, which typically features simple background music from Native flutes and drumming.",https://hermosillopomo.weebly.com/art-music-and-artifacts.html
    Video,"Documentary Short: Pomo Land Back: a Prayer From the Forest (2022), documenting an inter-tribal gathering.",https://www.nativewomeninfilm.com/pomo-land-back/
    Video,"Videos with subtitles of Northern Pomo stories and texts, including recordings of speakers Edna Campbell Guerrero and Elenor Stevenson Gonzales.",https://www.northernpomolanguagetools.com/texts/
    Document,"Oral History: The Pomo creation story of the sun and moon, created by Coyote and Hawk.",https://en.wikipedia.org/wiki/Pomo_traditional_narratives

    Puebloan Peoples

    Asset Type,Description,Source / Link
    Image,Pueblo art including pottery and turquoise jewelry.,https://libapps.salisbury.edu/nabb-online/exhibits/show/native-americans-then-and-now/pueblo-art
    Image,"Paintings by Miguel Camarena that depict Pueblo culture, landscapes, and spiritual rituals.",https://miguelcamarena.com/collections/pueblos-paintings
    Audio,"Album: The Pueblo Indians In Story, Song and Dance, featuring storyteller Swift Eagle.",https://folkways.si.edu/swift-eagle/the-pueblo-indians-in-story-song-and-dance/american-indian-childrens-prose/album/smithsonian
    Audio,"Recording: 'The Indian Speaks', featuring Domingo Montoya and Paul Tafoya of the All Indian Pueblo Council.",https://www.nativeoralhistory.org/digital-heritage/recording-indian-speaks-domingo-montoya-and-paul-tafoya-all-indian-pueblo-council
    Video,"Videos from the Indian Pueblo Cultural Center, including 'It All Starts Here.'",https://indianpueblo.org/media-center/
    Video,"Pueblo Voices, a series of videos where Pueblo people and archaeologists discuss aspects of Pueblo history and culture.",https://crowcanyon.org/resources/pueblo-voices-corn/
    Document,"Oral traditions that are a continuous dialogue about all aspects of life including beliefs, stories, songs, and dances.",https://home.nps.gov/band/learn/historyculture/oral.htm

    Seminole

    Asset Type,Description,Source / Link
    Image,"Seminole patchwork clothing, including a man's satin jacket and a woman's handmade skirt by Ida Cypress.",https://thefabledthread.com/blog/seminole-clothing
    Image,"Seminole crafts including beadwork, sweetgrass baskets, and Seminole dolls made of palmetto fiber.",https://floridaseminoletourism.com/the-art-of-seminole-crafts/
    Image,"Collection of Seminole art and adornment, including an embroidered and beaded bandolier bag and patchwork clothing.",https://omart.org/exhibitions/enduring_seminole/
    Audio,"Recordings of traditional Seminole songs from the 1930s and 40s, including songs from the Green Corn Dance and the Hunting Dance.",https://www.loc.gov/item/ihas.200197481
    Audio,Music by modern Seminole musicians like former Chairman James E. Billie and the duo Spencer Battiest and Doc Native.,https://floridaseminoletourism.com/seminole-music/
    Audio,"The Ah-Tah-Thi-Ki Museum's Oral History Collection, which includes recordings in the Miccosukee and Creek languages.",https://www.ahtahthiki.com/oral-history/
    Video,"Documentary: Seminole Pathways, a film about the history and culture of the Seminole Tribe of Florida.",https://www.youtube.com/watch?v=8IJtNpMlFVo
    Video,Documentary: Freedom Seekers: Black Seminoles of the Past and Present.,https://www.documentary.org/project/freedom-seekers-black-seminoles-past-and-present
    Video,"Archival footage of Tribal events and historical moments, available to Tribal Members upon request.",https://seminolemediaproductions.com/
    Document,Oral History: The Ah-Tah-Thi-Ki Museum's program to preserve Seminole history and culture by recording tribal members' stories.,"https://www.ahtahthiki.com/oral-history/#:~:text=The%20Ah%2DTah%2DThi%2DKi%2D,the%20American%20Alliance%20of%20Museums."

    Shawnee

    Asset Type,Description,Source / Link
    Image,"Painting: 'Red Coat – Shawnee Chief Tecumseh' by Doug Hall, depicting the leader on horseback.",https://doughallgallery.com/product/red-coat-shawnee-chief-tecumseh-fine-art-prints/
    Image,"Exhibits at the Shawnee Tribe Cultural Center, including historic and contemporary pottery.",https://nativeamerica.travel/listings/shawnee-tribe-cultural-center
    Audio,"Shawnee language recordings, including linguistic elicitations of grammar and vocabulary, and personal narratives.",http://www.language-archives.org/item/oai:indigenousguide.amphilsoc.org:10892
    Audio,"Music from Shawnee Press, a publisher of choral, vocal, and instrumental sheet music.",https://www.prestomusic.com/sheet-music/publishers/77--shawnee-press
    Video,"Documentary: The Past is Prologue: The Shawnee Tribe, detailing the history and migrations of the Shawnee people.",https://www.youtube.com/watch?v=0DOTJPYSjXU
    Video,"Video: 'Shawnee Language Page Introduction,' a greeting from Shawnee Tribe representative George Blanchard.",https://www.nps.gov/media/video/view.htm%3Fid%3DC1F3E2FE-A37E-496C-8E4B-04A5E275322E
    Document,PDF of the Eastern Shawnee 1938 Roll.,https://www.estoo-nsn.gov/library/page/george-j-captain-public-library

    Shoshone

    Asset Type,Description,Source / Link
    Image,"Photograph: 'Shoshone' by Timothy H. O'Sullivan (1867-72), an albumen silver print depicting thirteen Shoshoni men.",https://www.metmuseum.org/art/collection/search/283214
    Image,"Hide Painting of the Sun Dance, attributed to Eastern Shoshone artist Cotsiogo (Cadzi Cody).",https://smarthistory.org/eastern-shoshone-hide-painting-of-the-sun-dance-attributed-to-cotsiogo-cadzi-cody/
    Image,Photograph of Chief Washakie (c. 1865) wearing a trade blanket and an embroidered sash.,https://faculty.weber.edu/kmackay/michael_kosuge.htm
    Audio,"Album: 'Newe Hupia: Shoshoni Poetry Songs', a collection of songs in Shoshoni and English.",https://digitalcommons.usu.edu/usupress_pubs/24/
    Audio,"Recording of a Shoshone Sunrise song, sung every morning at the Sundance, performed by Tissiwungu Gould.",https://www.nativeoralhistory.org/digital-heritage/shoshone-sunrise-song-aug-1966
    Audio,"Digitized recordings of the Shoshoni language, including conversations and linguistic elicitations.",https://indigenousguide.amphilsoc.org/search?f%5B0%5D=guide_language_content_title%3AShoshoni
    Video,"Documentary: Who are the Eastern Shoshone?, which details the tribe's history and the leadership of Chief Washakie.",https://www.pbslearningmedia.org/resource/who-are-the-eastern-shoshone-video/wyomings-native-americans/
    Video,"Documentary: The Shoshone Nation's quest to reclaim Bear River, from the series WILD HOPE.",https://www.youtube.com/watch?v=AUwm1EH1LPk
    Video,"Audio and video books with full English-Shoshoni transcripts, including stories like 'Kutise Itsappeh (Crazy Coyote).'",https://shoshoniproject.utah.edu/language-materials/audio-video-books.php
    Document,"Oral History: The Northwestern Shoshone have a strong oral tradition, passing down stories and tribal histories through memorization.",https://utahindians.org/archives/shoshone/didYouKnow.html

    Sioux

    Asset Type,Description,Source / Link
    Image,"Artworks from the Sioux Indian Museum, including historic clothing, horse gear, weapons, and contemporary arts and crafts.",https://www.doi.gov/iacb/our-museums/sioux
    Image,"Collection of Sioux art at The Metropolitan Museum of Art, including a courting flute, a woman's dress (c. 1870), and a tipi bag.",https://www.metmuseum.org/art/collection/search?q=Sioux&sortBy=Relevance
    Audio,"Traditional Sioux music, including society songs like the 'Omaha Society Song' and 'Brave Heart Society Song.'",https://drumhop.com/music.php?page=155
    Audio,"Recordings of the Dakota/Lakota language, including interviews and radio broadcasts from the 1950s onward.",https://www.delaman.org/members/standing-rock-sioux-tribe-language-and-culture-institute/
    Video,"Documentary: Oceti Sakowin: The People of the Seven Council Fires, an overview of the Dakota, Lakota, and Nakota people.",https://www.sdpb.org/native-american-studies-multimedia
    Video,"Documentary: The Sioux: From Red Cloud to Wounded Knee, covering the history of the Sioux, including the Wounded Knee Massacre.",https://www.youtube.com/watch?v=oIjAkJlHZZA
    Video,"Recordings with Sioux language or cultural content, including interviews and documentaries.",https://recherche-research.bac-lac.gc.ca/eng/public/list/46489
    Document,Oral History: The Dakota have kept their history alive for thousands of years through the oral tradition of storytelling (Ohuŋkaŋkaŋ).,https://www3.mnhs.org/usdakotawar/stories/history/dakota-homeland-land-lifestyle/oral-tradition

    Zuni

    Asset Type,Description,Source / Link
    Image,"Zuni art including pottery, fetish carvings, and jewelry from the Ancestral Rich Treasures of Zuni Cooperative (ARTZ).",https://www.zunipuebloart.com/
    Image,Zuni art including a polychrome jar (c. 1875) and a polychrome bowl by the artist We'wha (c. 1890).,https://www.artic.edu/artists/29970/zuni
    Image,Zuni art including handcrafted silver inlay jewelry and pottery with traditional heart-line deer and rain bird designs.,https://www.indianpueblostore.com/collections/zuni
    Audio,"Album: Zuni Traditional Songs from the Zuni Pueblo, featuring songs for the Rain Dance, Buffalo Dance, and Corn Dance.",https://music.apple.com/us/artist/zuni-pueblo-singers/88617963
    Audio,Audio recordings of Bible stories and hymns in the Zuni language.,https://globalrecordings.net/en/language/zun
    Video,"Documentary: Zuni in the Grand Canyon, which follows A:shiwi rain priests and medicine men on a sacred pilgrimage.",https://skyshipfilms.com/zuni-in-the-grand-canyon
    Video,"Documentary: Continuity through Creation: A living culture through the art of the Zuni People.",https://www.youtube.com/watch?v=ejLUZ-YDPMs
    Video,"Performance of the Pottery Dance by the Cellicion Zuni Dancers, a traditional social dance.",https://www.nps.gov/media/video/view.htm%3Fid%3D07BF7DA3-BAE6-4F9C-99B4-D1B7AC48A631
    Document,Oral History: An artist's depiction of the Zuni migration story.,https://home.nps.gov/band/learn/historyculture/oral.htm
    """;

    // --- GeoJSON Data Structure Classes ---

    // Represents the entire GeoJSON file structure.
    record FeatureCollection(String type, List<Feature> features) {}

    // Represents a single feature (in this case, a single tribe).
    record Feature(String type, Geometry geometry, Properties properties) {}

    // Represents the geographic data for a feature.
    record Geometry(String type, double[] coordinates) {}

    // Represents the descriptive properties of a feature.
    record Properties(
            String name,
            String description,
            String image,
            String audio,
            String video,
            String website,
            @SerializedName("tribalAssets") List<TribalAsset> tribalAssets
    ) {}

    // Represents a single media asset for a tribe.
    record TribalAsset(String type, String title, String url) {}
}
