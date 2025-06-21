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
        // Each tribe's data is separated by a blank line followed by the tribe name.
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
