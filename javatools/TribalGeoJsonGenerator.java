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
        String[] tribalDataBlocks = RAW_TRIBAL_DATA.split("\n\n\n");

        for (String block : tribalDataBlocks) {
            if (block.trim().isEmpty()) continue;

            String[] lines = block.trim().split("\n");
            String tribeName = lines[0].trim();

            // Skip the header line of the asset table
            List<String> assetLines = Arrays.stream(lines)
                    .skip(2)
                    .filter(line -> !line.trim().isEmpty())
                    .collect(Collectors.toList());

            List<TribalAsset> tribalAssets = new ArrayList<>();
            for(String assetLine : assetLines) {
                // The data is comma-separated, but descriptions can contain commas.
                // We will split by comma but handle this carefully. A more robust
                // solution would use a proper CSV parser.
                String[] parts = assetLine.split(",", 3);
                if(parts.length >= 3) {
                    String type = parts[0].trim().toLowerCase();
                    // Capitalize the first letter of the type for consistency
                    type = type.substring(0, 1).toUpperCase() + type.substring(1);
                    String title = parts[1].replace("\"", "").trim();
                    String url = parts[2].trim();
                    tribalAssets.add(new TribalAsset(type, title, url));
                }
            }

            // Create the properties for the GeoJSON feature
            Properties properties = new Properties(
                    tribeName,
                    "Cultural assets and information for the " + tribeName + " tribe.",
                    "", // image
                    "", // audio
                    "", // video
                    "", // website
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

    // Static raw data string copied from the provided document.
    // In a real-world application, this would be read from a file.
    private static final String RAW_TRIBAL_DATA = """
    Abenaki

    Asset Type,Description,Source / Link
    Image,"Painting: ""18th Century Abenaki Couple"" by Francine Poitras Jones, depicting post-contact clothing with wool, linen, and trade goods.",https://hidden.coplacdigital.org/afualor/wp-content/uploads/sites/18/2018/10/18th-Century-Abenaki-Couple-by-Francine-Poitras-Jones-Nulhegan-Abenaki-1-1024x768.jpg
    Image,"Replica of an archaic style dress made from milkweed plant fiber, representing pre-contact attire. Made by Vera Walker Sheehan.",https://hidden.coplacdigital.org/afualor/wp-content/uploads/sites/18/2018/10/Archaic-Style-Dress-by-Vera-Walker-Sheehan-1-768x1024.jpg
    Audio,"Language and cultural recordings, including the Paul Thompson fonds and Bernard Assiniwi fonds.",https://recherche-research.bac-lac.gc.ca/eng/public/list/46319
    Video,"Documentary:  Waban-Aki: People from Where the Sun Rises  (2006), a feature-length film by Abenaki filmmaker Alanis Obomsawin.",https://www.tenk.ca/en/documentaires/the-films-of-alanis-obomsawin/waban-aki-people-from-where-the-sun-rises
    Document,PDF on Abenaki Music and Dances.,https://moose.nhhistory.org/Moose/media/Default/Documents%20and%20PDFs/Unit-2-docs/U2-Music-and-Dances.pdf


    Absaroka (Crow)

    Asset Type,Description,Source / Link
    Image,"Painting: ""Distinguished Crow Indians"" by George Catlin (1861/1869), oil on card mounted on paperboard.",https://www.nga.gov/artworks/50328-distinguished-crow-indians
    Audio,"Album: ""Crow Tribal Sundance Songs,"" featuring 14 songs by Pete Whiteman and Milton Yellow Mule.",https://indianhouse.com/products/crow-tribal-sundance-songs
    Video,"Documentary:  Crow Country: Our Right to Food Sovereignty , directed by Tsanavi Spoonhunter.",https://www.crowcountrydoc.com/


    Apache

    Asset Type,Description,Source / Link
    Image,"Historical portraits of leaders Geronimo, Mangas Coloradas, and Victorio.",https://mescaleroapachetribe.com/our-culture/
    Audio,"Western Apache Audio Bible, including the full New Testament and hymns.",https://todaysnative.org/native-language-audio-bible/apache-audio-bible/
    Video,"Documentary:  Unconquered: Allan Houser and the Legacy of One Apache Family , about the life and work of the Chiricahua Apache sculptor.",https://www.youtube.com/watch?v=KN9SifI6xbs


    Arapaho

    Asset Type,Description,Source / Link
    Image,Ledger art by Frank Henderson depicting warrior society dances and battle exploits.,https://www.metmuseum.org/art/collection/search/679641
    Audio,"Digitized sound recordings of the Arapaho language, including grammar, vocabularies, and oral narratives.",https://indigenousguide.amphilsoc.org/search?f%5B0%5D=guide_culture_content_title%3AArapaho&f%5B1%5D=guide_subject_content_title%3ALinguistics&f%5B2%5D=guide_type_content_title%3ASound%20recording
    Video,"Documentary:  We Are the Arapaho People , examining the history, culture, and identity of the Northern Arapaho.",https://www.arapahotruths.com/we-are-the-arapaho-people


    Blackfeet (Siksikaitsitapi)

    Asset Type,Description,Source / Link
    Image,"Man's shirt (c. 1880) made of red wool trade cloth, with weasel-fur fringe and beaded rosettes.",https://www.metmuseum.org/art/collection/search/642585
    Audio,Audio recordings of the Gospels of John and Acts in the Blackfoot language.,https://todaysnative.org/native-language-audio-bible/blackfoot-audio-bible/
    Video,"Documentary:  Backbone of the World: The Blackfeet  (1998), about the tribe's struggle to protect their sacred Badger-Two Medicine area.",https://itvs.org/films/backbone-of-the-world/


    Caddo

    Asset Type,Description,Source / Link
    Image,"Caddo pottery, including carinated bowls and long-necked bottles with intricate engraved designs.",https://www.texasbeyondhistory.net/tejas/clay/tradition.html
    Audio,"Linguistic field recordings of the Caddo language from 1956, including vocabulary, stories, and prayers.",https://cla.berkeley.edu/collection/?collid=10163=The%20Daniel%20DaCruz%20collection%20of%20Caddo%20sound%20recordings
    Video,"Documentary:  Caddo Voices: A Basketry Revival , following modern Caddo people as they work to restore the tradition of river cane basketry.",https://www.pbs.org/video/caddo-voices-a-basketry-retrieval-coesgt/


    Cherokee

    Asset Type,Description,Source / Link
    Image,"Traditional Cherokee arts and crafts including basketry, pottery, and carving.",https://quallaartsandcrafts.org/
    Audio,Audio recording of the entire Gospel of John in the Cherokee language.,https://todaysnative.org/native-language-audio-bible/cherokee-audio-resources/
    Video,"Documentary:  By Blood  (2016), chronicling the conflict over tribal rights between the Cherokee Nation and the Cherokee Freedmen.",https://www.amdoc.org/watch/blood/

    
    Cheyenne

    Asset Type,Description,Source / Link
    Image,Painted tipi curtain from the Elkhorn Scraper Warrior Society and a painted robe with a sunburst design (c. 1850-1870).,https://www.artic.edu/artworks/100658/painted-tipi-curtain-victory-record-of-the-elkhorn-scraper-warrior-society
    Audio,"Audio course:  Let's Talk Cheyenne , an introductory course with audio files recorded by elder Ted Risingsun.",https://www.cheyennelanguage.org/letstalk.htm
    Video,"Documentaries produced by the Cheyenne River Youth Project, such as  Wakanyeja Kin Wana Ku Pi (The Children are Coming Home) .",https://lakotayouth.org/about/documentaries/

    
    Chickasaw

    Asset Type,Description,Source / Link
    Image,Bronze statue by James Blackburn depicting traditional Chickasaw hunters.,https://www.chickasawculturalcenter.com/explore/statues-sculptures/
    Audio,Language recordings of Chickasaw words for local plants and animals.,http://www.wolfgaptn.com/qr-12
    Video,"Documentary:  First Encounter , chronicling the tribe's first contact with the Hernando de Soto expedition in 1540.",https://chickasawfilms.com/Projects/Documentaries


    Comanche

    Asset Type,Description,Source / Link
    Image,"Painting: ""The Buffalo Chase"" by George Catlin.",https://www.tshaonline.org/handbook/entries/comanche-indians
    Audio,"Audio recordings of ""Words of Life,"" including Bible stories and evangelistic messages in the Comanche language.",https://globalrecordings.net/en/language/com
    Video,"Documentary:  Quanah Parker: The Last Comanche , a chronicle of the last Comanche leader.",https://tv.apple.com/us/episode/quanah-parker-the-last-comanche/umc.cmc.52pwsa7omxc1plpf3coar3w6o


    Creek (Muscogee)

    Asset Type,Description,Source / Link
    Image,"Painting of Tchow-ee-put-o-kaw, a Creek woman in traditional fringed skin garments, by George Catlin (1836).",https://homepages.rootsweb.com/~cmamcrk4/crk5.html
    Audio,"Mvskoke Language Program audio links for 1st, 2nd, and 3rd level language learners.",https://www.muscogeenation.com/department-of-education-and-training/mvskoke-language-program/
    Video,"Documentary:  The Forgotten Creeks , an Emmy Award-winning film about the history of the Poarch Creek Indians.",https://pci-nsn.gov/our-story/the-forgotten-creeks/


    Delaware (Lenape)

    Asset Type,Description,Source / Link
    Image,"Artwork by Lenape artists from 1920 to the present, including paintings by Jacob Parks and Ruthe Blalock Jones.",https://delawaretribe.org/wp-content/uploads/Artwork-by-Lenape-Artists.pdf
    Audio,"The Lenape Talking Dictionary, containing over 15,000 words, with sound files for nearly 6,350 words.",http://www.talk-lenape.org/
    Video,"Documentary:  Drive By History: The Secret World of the Lenape , an investigation into the sophisticated civilization of the Lenape.",https://www.pbs.org/video/the-secret-world-of-the-lenape-and-truths-about-1770s-life-ks8nel/

    
    Flathead (Salish)

    Asset Type,Description,Source / Link
    Image,"Images of Salish and Dene clothing, including a general image and one related to weaving.",https://s3-us-west-2.amazonaws.com/tota-images/1639605703151-b7f5d4862a8ac2b4.png
    Audio,"Audio recordings of Salish language, including pronunciation drills and vocabulary for animals, clothing, and plants.",http://salishaudio.org/audio/
    Video,"Documentary:  Saving Salish , which documents the N'kwusm Salish language immersion school on the Flathead Indian Reservation.",https://www.pbs.org/show/saving-salish/


    Hopi

    Asset Type,Description,Source / Link
    Image,"Art from the Hopi Arts Trail, including pottery, Kachina Doll carving, basket weaving, and silversmithing.",https://hopiartstrail.com/
    Audio,"Album:  Hopi Tales , featuring spoken-word stories performed by actor Jack Moyles.",https://folkways.si.edu/jack-moyles/hopi-tales/american-indian-childrens-spoken-word/album/smithsonian
    Video,"Documentary:  The Hopi: Mesas, Native American Indian Documentary  (1982), an in-depth look at seasonal rituals and Hopi culture.",https://www.ebay.com/itm/277079042802


    Iroquois (Haudenosaunee)

    Asset Type,Description,Source / Link
    Image,"Contemporary Iroquois art including basketry, antler carving, painting, and stone sculpture.",https://www.iroquoismuseum.org/collections
    Audio,"Recordings of Iroquois social songs, including ""Women's Rabbit Songs.""",https://recherche-research.bac-lac.gc.ca/eng/public/list/46458
    Video,"Documentary Series:  The Iroquois , a four-part series exploring Iroquois culture.",https://www.pbs.org/show/wmht-specials/collections/iroquois/


    Kiowa

    Asset Type,Description,Source / Link
    Image,"Watercolor paintings by the Kiowa Six, a collective of artists from the early 20th century, depicting ceremonial life.",https://www.nypl.org/events/exhibitions/galleries/fortitude/item/10088
    Audio,"Album:  Kiowa , featuring drumming and chanting by Kenneth Anquoe, including Flag Song, Gourd Dance, and War Dance songs.",https://folkways.si.edu/kenneth-anquoe/kiowa/american-indian/music/album/smithsonian
    Video,Documentary footage of Kiowa people.,https://www.youtube.com/watch?v=wcqflbbDIFo


    Lakota (Sioux)

    Asset Type,Description,Source / Link
    Image,"Black Bonnet War Robe  (1963), a painted bison robe by Yanktonai Sioux artist Herman Red Elk.",https://www.doi.gov/iacb/TreasuresHerman
    Audio,"Lakota Language Consortium audio series, a practical conversation course with multiple levels and units.",https://music.apple.com/us/artist/lakota-language-consortium/368331769
    Video,"Documentary:  Without Arrows , an intimate portrait of contemporary Lakota life.",https://www.pbs.org/independentlens/documentaries/without-arrows/


    Navajo (Diné)

    Asset Type,Description,Source / Link
    Image,"Navajo art including sand paintings, turquoise and silver jewelry, woven ceremonial baskets, and pottery.",https://www.invaluable.com/blog/navajo-art/
    Audio,"Audio course:  Dine Bizaad: Speak, Read, Write Navajo , a set of 6 CDs with 5 hours of audio lessons.",https://salinabookshelf.com/products/dine-bizaad-speak-read-write-navajo-audio-set-lessons-1-30-cd
    Video,"Documentary:  Jake Livingston – Navajo-Zuni Silversmith , containing stories from his life.",http://navajopeople.org/


    Nez Percé

    Asset Type,Description,Source / Link
    Image,"Traditional Nez Perce art, including geometric and floral patterns in decorations and beadwork.",https://www.fs.usda.gov/main/npnht/learningcenter/history-culture
    Audio,"Recording of Elizabeth Penney Wilson, a Nez Perce tribal member, singing a hymn in the nimipuutímt language.",https://www.nps.gov/media/sound/view.htm?id=07BF7DA3-BAE6-4F9C-99B4-D1B7AC48A631
    Video,"Documentary:  Sacred Journey of the Nez Perce , chronicling the tribe's 1,600-mile journey during the Nez Perce War of 1877.",https://www.pbs.org/show/sacred-journey-nez-perce/


    Pawnee

    Asset Type,Description,Source / Link
    Image,"Painting: ""Pawnee Indians"" by George Catlin (1861/1869), depicting three warriors and a woman.",https://www.nga.gov/artworks/50368-pawnee-indians
    Audio,"Album:  Music of the Pawnee , featuring 45 songs sung by Mark Evarts, recorded in 1936.",https://folkways.si.edu/mark-evarts/music-of-the-pawnee/american-indian/album/smithsonian
    Video,"Documentary:  Pawnee Seed Warriors Revive Ancient Ties to Ancestors , following seed keepers working to regain food sovereignty.",https://www.rmpbs.org/shows/homegrown-documentary-shorts-collection/episodes/pawnee-seed-warriors-revive-ancient-ties-ancestors-vnnbq1


    Pomo

    Asset Type,Description,Source / Link
    Image,"Pomo basketry, considered among the finest in the world, using a wide variety of weaving techniques.",https://www.metmuseum.org/exhibitions/jules-tavernier/visiting-guide
    Audio,"Music for Pomo dances, which typically features simple background music from Native flutes and drumming.",https://hermosillopomo.weebly.com/art-music-and-artifacts.html
    Video,"Documentary Short:  Pomo Land Back: a Prayer From the Forest  (2022), documenting an inter-tribal gathering.",https://www.nativewomeninfilm.com/pomo-land-back/


    Puebloan Peoples

    Asset Type,Description,Source / Link
    Image,Pueblo art including pottery and turquoise jewelry.,https://libapps.salisbury.edu/nabb-online/exhibits/show/native-americans-then-and-now/pueblo-art
    Audio,"Album:  The Pueblo Indians In Story, Song and Dance , featuring storyteller Swift Eagle.",https://folkways.si.edu/swift-eagle/the-pueblo-indians-in-story-song-and-dance/american-indian-childrens-prose/album/smithsonian
    Video,"Videos from the Indian Pueblo Cultural Center, including ""It All Starts Here.""",https://indianpueblo.org/media-center/


    Seminole

    Asset Type,Description,Source / Link
    Image,"Seminole patchwork clothing, including a man's satin jacket and a woman's handmade skirt by Ida Cypress.",https://thefabledthread.com/blog/seminole-clothing
    Audio,"Recordings of traditional Seminole songs from the 1930s and 40s, including songs from the Green Corn Dance and the Hunting Dance.",https://www.loc.gov/item/ihas.200197481
    Video,"Documentary:  Seminole Pathways , a film about the history and culture of the Seminole Tribe of Florida.",https://www.youtube.com/watch?v=8IJtNpMlFVo


    Shawnee

    Asset Type,Description,Source / Link
    Image,"Painting: ""Red Coat – Shawnee Chief Tecumseh"" by Doug Hall, depicting the leader on horseback.",https://doughallgallery.com/product/red-coat-shawnee-chief-tecumseh-fine-art-prints/
    Audio,"Shawnee language recordings, including linguistic elicitations of grammar and vocabulary, and personal narratives.",http://www.language-archives.org/item/oai:indigenousguide.amphilsoc.org:10892
    Video,"Documentary:  The Past is Prologue: The Shawnee Tribe , detailing the history and migrations of the Shawnee people.",https://www.youtube.com/watch?v=0DOTJPYSjXU


    Shoshone

    Asset Type,Description,Source / Link
    Image,"Photograph: ""Shoshone"" by Timothy H. O'Sullivan (1867-72), an albumen silver print depicting thirteen Shoshoni men.",https://www.metmuseum.org/art/collection/search/283214
    Audio,"Album:  ""Newe Hupia: Shoshoni Poetry Songs"" , a collection of songs in Shoshoni and English.",https://digitalcommons.usu.edu/usupress_pubs/24/
    Video,"Documentary:  Who are the Eastern Shoshone? , which details the tribe's history and the leadership of Chief Washakie.",https://www.pbslearningmedia.org/resource/who-are-the-eastern-shoshone-video/wyomings-native-americans/


    Sioux

    Asset Type,Description,Source / Link
    Image,"Artworks from the Sioux Indian Museum, including historic clothing, horse gear, weapons, and contemporary arts and crafts.",https://www.doi.gov/iacb/our-museums/sioux
    Audio,"Traditional Sioux music, including society songs like the ""Omaha Society Song"" and ""Brave Heart Society Song.""",https://drumhop.com/music.php?page=155
    Video,"Documentary:  Oceti Sakowin: The People of the Seven Council Fires , an overview of the Dakota, Lakota, and Nakota people.",https://www.sdpb.org/native-american-studies-multimedia


    Zuni

    Asset Type,Description,Source / Link
    Image,"Zuni art including pottery, fetish carvings, and jewelry from the Ancestral Rich Treasures of Zuni Cooperative (ARTZ).",https://www.zunipuebloart.com/
    Audio,"Album:  Zuni Traditional Songs from the Zuni Pueblo , featuring songs for the Rain Dance, Buffalo Dance, and Corn Dance.",https://music.apple.com/us/artist/zuni-pueblo-singers/88617963
    Video,"Documentary:  Zuni in the Grand Canyon , which follows A:shiwi rain priests and medicine men on a sacred pilgrimage.",https://skyshipfilms.com/zuni-in-the-grand-canyon
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
