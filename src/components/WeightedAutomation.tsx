import React, { useState, useRef } from 'react';
import { ParsedForm, QuestionType, FormItem } from '../types';
import { WeightedQuestionRenderer } from './WeightedQuestionRenderer';
import { Spinner } from './Spinner';
import { Play, Square, Sliders, RotateCcw, Shuffle, ArrowLeft, Sparkles, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { creditsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface WeightedAutomationProps {
    form: ParsedForm;
    onBack: () => void;
}

interface LogEntry {
    id: number;
    status: 'success' | 'error' | 'stopped';
    message: string;
    time: string;
}

// --- NAME LISTS ---
const MALE_NAMES = [
    "Ravichandran", "Prasannakumar", "Revanthkumar", "Rajadurai", "Kavinesh", "Aravindan", "Anbumalar", "Keshwant", "Nidhesh", "Harinath", "Ilanchezhiyan", "Nishanth", "Adhavan", "Akshay", "Rakesh", "Elangovan", "Darshan", "Sharan", "Agamaran", "Madhavanraj", "Inbanathan", "Akathiyan", "Arunaachalam", "Aadhithya", "Saranraj", "Bhagavan", "Charuvik", "Devaananth", "Litesh", "Dhina", "Rajanathan", "Bharat", "Nilavan", "Dhilip", "Aariv", "Nirmalkumar", "Arvind", "Oviyan", "Lavanyan", "Mugilan", "Jeyan", "Tarun", "Lakshminarayan", "Aravath", "Boobalan", "Krithin", "Nalan", "Elumalai", "Madhesh", "Nithin", "Malaravan", "Aadhit", "Murali", "Balamurali", "Anandan", "Pritiv", "Elavarasan", "Dayanand", "Murugaraj", "Mathisoodan", "Karthik", "Ezhilvendhan", "Punithan", "Gokulnath", "Gopinath", "Rishikesh", "Ramesh", "Annamalai", "Haribaskar", "Pramodkumar", "Ravishankar", "Janakiraman", "Ainkaran", "Balaji", "Aarathiyan", "Jayaraman", "Anthuvan", "Aaruthiran", "Nandha", "Sanjeev", "Adhishwar", "Mani", "Nikhilan", "Nigilan", "Nihar", "Dayanithi", "Aathireyan", "Nibunraj", "Geethan", "Anantharaj", "Nagarajan", "Rishi", "Balamurugan", "Pradeepkumar", "Prithviraj", "Nithyanandam", "Naveenkumar", "Hemeshwar", "Haresh", "Kalaiarasan", "Aathimithran", "Pavithranraj", "Charunath", "Dharun", "Abayan", "Gnanasekar", "Ashokan", "Adhith", "Rathnamraj", "Elavarasan", "Vignesh", "Ravikiran", "Amalan", "Ananthanathan", "Pranav", "Devarajan", "Aruneshwaran", "Agilesh", "Kishoreraj", "Kamaleshraj", "Prathap", "Ramanathanraj", "Priyanraj", "Sathish", "Aathvikraj", "Kumaresan", "Nedumaran", "Agastya", "Rakshith", "Jivith", "Komagan", "Rishiraj", "Girishkumar", "Hiteshraj", "Arul", "Ineshwar", "Ruban", "Jeevan", "Nila", "Abhi", "Aakash", "Sarathi", "Akshathraj", "Karunakaran", "Pandiyan", "Dhineshraj", "Bhuvish", "Aarman", "Damu", "Krishnagopal", "Aatral", "Dananjeyan", "Devaprasad", "Anbu", "Elumalai", "Jothikumar", "Nithish", "Aathiraichelvan", "Manikandan", "Ilangkumaran", "Nareshkumar", "Muralidharan", "Jayaram", "Govind", "Jiva", "Keerthi", "Nibun", "Padmesh", "Ezhilvendan", "Purushothaman", "Magizhan", "Jaicharan", "Dhyanesh", "Saran", "Mahesh", "Rishwanth", "Amuthesh", "Prahallad", "Marudhu", "Ranjith", "Chezhian", "Karuna", "Ratnam", "Athiban", "Pratik", "Athavan", "Devabalan", "Jeyapandian", "Ashath", "Ganeshan", "Deivamani", "Advik", "Nedumaran", "Praveenkumar", "Dharshan", "Devith", "Cheran", "Ilakkiyan", "Chenthooran", "Dharanesh", "Ishaanraj", "Adhiran", "Edwin", "Madhav", "Janarthan", "Manishraj", "Dharshith", "Prithvi", "Lakshman", "Anushanth", "Manimaran", "Asmithan", "Bhalaji", "Bavanish", "Kanimoli", "Kalaiselvan", "Chokkalingam", "Duraiarasu", "Abineshraj", "Nalanthan", "Saravanan", "Saravana", "Chidambaram", "Arulalan", "Harivardhan", "Dharunraj", "Palani", "Baskaran", "Ezhil", "Prashanthkumar", "Dayalan", "Rajkumarraj", "Devadarsan", "Madhusudhan", "Aathisharman", "Athif", "Inesh", "Hemachandran", "Liyan", "Amaresan", "Nagulan", "Rishikeshraj", "Ravishankarraj", "Lavan", "Eeshwar", "Aadhipan", "Cheramaan", "Jaisankar", "Nithil", "Anbuchelvan", "Lingesh", "Sanjay", "Aathvik", "Nitinkumar", "Nithilarasan", "Nandhakumar", "Kannanraj", "Prashanth", "Kaviarasu", "Ilaiyaraaja", "Chellamani", "Ebinesar", "Selva", "Dhruv", "Appu", "Boobal", "Ishwar", "Jaiganesh", "Sachin", "Chithiran", "Gurunathan", "Elakkiyadasan", "Liyash", "Bavan", "Aruldoss", "Aatralarasan", "Rakshithkumar", "Bhashyam", "Dheivamani", "Nithishkumar", "Jeevaanandham", "Harshavardhan", "Amaran", "Gowthamraj", "Adalarasu", "Siddharth", "Devanathan", "Appunni", "Advaith", "Muthukrishnan", "Ponniyinselvan", "Keerthirajan", "Praveen", "Hrishikesh", "Manikandanraj", "Dhanush", "Nigilan", "Gokul", "Elil", "Malaravan", "Gokulan", "Jaisankar", "Mathavan", "Aathavan", "Cheliyan", "Lokeshraj", "Manas", "Nithya", "Elavarasu", "Anbumani", "Anbarasan", "Gururaj", "Raghukumar", "Arjunraj", "Sharvesh", "Abhijith", "Mithun", "Akshayan", "Eshwar", "Gauthamraj", "Keerthivardhan", "Dharan", "Inba", "Haridass", "Inian", "Dushanth", "Kannadasan", "Nidheshwar", "Nilavan", "Devarajan", "Priyan", "Lakshmanan", "Adithya", "Nilavarasu", "Kanishk", "Arunjith", "Madhukiran", "Hrithikraj", "Abhilash", "Balasubramani", "Ilampari", "Iniyan", "Rudhran", "Elangumaran", "Anishwar", "Parameshwar", "Dhinesh", "Mithunraj", "Kulasekaran", "Shiva", "Arvindkrishna", "Arulmozhi", "Murugan", "Kaviraj", "Natarajan", "Bashyam", "Jeyaram", "Arisuran", "Rajesh", "Eniyavan", "Bhavesh", "Keshwin", "Mouli", "Haran", "Haricharan", "Nirmal", "Santhosh", "Barathan", "Aswath", "Neelan", "Ilango", "Jeyakandan", "Aaranyen", "Elilmaran", "Aathidevan", "Dhivyanthan", "Arivunithi", "Karthikeyan", "Barathwaaj", "Ramachandhiran", "Anganan", "Idhayan", "Rohan", "Aasai", "Jeyamani", "Jeeva", "Abhinay", "Gurucharan", "Chandramohan", "Karuppiah", "Govindaraj", "Dhrish", "Ebi", "Chaaran", "Jivithan", "Nandhakumar", "Niranjanraj", "Athishwar", "Jeevithkumar", "Jayakumar", "Inbanathan", "Dhivyan", "Dakshany", "Jayasimman", "Lakshmikanth", "Arivu", "Deshikan", "Agni", "Nivenkumar", "Mathan", "Perarasu", "Shashank", "Gowtham", "Deepak", "Athirayan", "Divakar", "Krithikraj", "Ethiraj", "Anuvardhan", "Gurunath", "Suriya", "Aadhavan", "Barathraj", "Dharanitharan", "Krishnakumar", "Kalaimani", "Gajapathi", "Kavipriyan", "Kalaiselvan", "Gowrishankar", "Anto", "Koushik", "Pratikraj", "Hariram", "Agamudaiyan", "Aahan", "Nivash", "Abhijeet", "Gnanavel", "Kathiravan", "Jairam", "Ilaiyavan", "Pandiarajan", "Harish", "Amudhesh", "Neelan", "Manivannan", "Narendrakumar", "Aadhira", "Praneeth", "Ragav", "Padmeshwar", "Maran", "Ilakkiya", "Vishal", "Navinkumar", "Kalaimani", "Krish", "Harinam", "Kumaranathan", "Agaran", "Anbarasan", "Kumar", "Pugazhendhi", "Premkumar", "Janakiraman", "Athiran", "Ganeshamoorthy", "Jegan", "Kavish", "Agathiyan", "Ram", "Jagan", "Devaguru", "Mohanraj", "Easwar", "Athish", "Ajesh", "Niruban", "Kuralarasan", "Pranavraj", "Ramanathan", "Nishanthkumar", "Niteshraj", "Kulothungan", "Deepanwar", "Krishnan", "Sahas", "Balamani", "Manickam", "Sunil", "Jagannath", "Sanjai", "Prakashraj", "Janarthanan", "Sethu", "Ravikirankumar", "Azhagan", "Aryan", "Jayachandran", "Pramod", "Sudhakar", "Elilarasan", "Kathiravan", "Kannan", "Kathirvelan", "Bhadresh", "Naveen", "Kamal", "Jai", "Boopathiraj", "Jothiram", "Atharva", "Devakumar", "Hrishi", "Lavanyan", "Kumaran", "Hariprasad", "Rajasekaran", "Iniyaraj", "Mukund", "Magizhan", "Ayyanar", "Ragavraj", "Agam", "Naresh", "Elaiya", "Ganapathi", "Pradeep", "Alaguchelvan", "Arivunidhi", "Pravin", "Ganesh", "Dharanidharan", "Hrithick", "Ishaan", "Kathiresan", "Daaman", "Mayilsamy", "Niranjan", "Aadhav", "Chandran", "Senthil", "Ashwin", "Nakul", "Kabilan", "Chellakannu", "Kavitharan", "Kumaresan", "Aravind", "Dashwanth", "Pavithran", "Chidarth", "Barath", "Danushraj", "Dashwin", "Aadhavraj", "Athiran", "Kokulan", "Baskar", "Agilan", "Geethan", "Rajeshkumar", "Hariharan", "Parthibaraj", "Dheeranathan", "Arulmani", "Neelakandan", "Revanth", "Madhavan", "Bavithran", "Selvam", "Raghu", "Balan", "Bharth", "Deepan", "Aarush", "Hariprasath", "Ganapathiraman", "Raghuvaranraj", "Jithen", "Mohitkumar", "Mukundhan", "Kapilan", "Arivuselvan", "Karthikayan", "Alagarsamy", "Chezhiyan", "Aruthan", "Iravathan", "Arulnithi", "Nagulan", "Manimaran", "Danush", "Dakshan", "Kavinilavan", "Kavin", "Avinash", "Chandrababu", "Edvinraj", "Chandraraj", "Mahendran", "Dineshraj", "Dhanushkodi", "Ravichandranraj", "Punithanraj", "Chellan", "Girish", "Arunesh", "Ovian", "Kothandapani", "Akshith", "Gautharn", "Anirudhan", "Chinmayan", "Ranjithkumar", "Heshanth", "Arunthayan", "Pravinkumar", "Guhan", "Ezhilan", "Keshav", "Ajay", "Lakshmi", "Akshey", "Kuralarasan", "Jeyavel", "Dhruvan", "Rakshanraj", "Chinmay", "Arivarasan", "Harishankar", "Gautham", "Abhimanyu", "Aananthajith", "Sarvesh", "Manish", "Jayanand", "Harshan", "Hitesh", "Kanishkan", "Ilango", "Premkumarraj", "Lingeshwar", "Manaswin", "Eniyan", "Atshayan", "Jayanth", "Bilahari", "Nikhilan", "Aadhishwar", "Devadarshan", "Harshavardhan", "Koushikraj", "Imman", "Adhik", "Jothiram", "Advith", "Devidasan", "Devendran", "Kathir", "Amudhan", "Mathanraj", "Jayapal", "Devesh", "Ahilan", "Kirubakaran", "Ilanchezhian", "Jayaprakash", "Karuppasamy", "Duraimurugan", "Rakshan", "Aravind", "Jaisurya", "Kishore", "Nitin", "Pradhosh", "Jeyachandran", "Gurucharan", "Athidevan", "Prasanna", "Nagaraj", "Dinidharan", "Jayaprakash", "Gubendran", "Prahalladhan", "Raja", "Kavineshwar", "Muthuselvan", "Niruban", "Sathya", "Krishna", "Inba", "Dheena", "Anvith", "Aswathaman", "Jatin", "Devish", "Jaisurya", "Mayon", "Rahul", "Hemant", "Mohit", "Atshayan", "Mohan", "Abhiman", "Giridhar", "Kapileswar", "Samaran", "Parithi", "Harsha", "Ritesh", "Gajendran", "Manibalan", "Kailash", "Gokulkrishna", "Gurumoorthy", "Sudarshan", "Ekambaram", "Badresh", "Abey", "Chandraprakash", "Kavivarmann", "Saisharan", "Nethran", "Balamithran", "Manibalan", "Devan", "Deva", "Riteshkumar", "Devaraj", "Rajkumar", "Kailashnath", "Dhiyash", "Thaman", "Kaviselvan", "Raghavendran", "Abishek", "Guru", "Ashwanth", "Pugazh", "Kabilar", "Jaikishan", "Liteshraj", "Hanish", "Ponniyan", "Aanazhagan", "Jayakanthan", "Badri", "Bhuvan", "Barathkumar", "Haridass", "Ilangovan", "Muthukumaran", "Chithraichelvan", "Dharani", "Elanchezhiyan", "Aadhil", "Paramesh", "Nitesh", "Dheeran", "Bhaskarraj", "Kesavraj", "Alaguthambi", "Akhilan", "Dhivakar", "Dakshin", "Jayaraman", "Ekambaram", "Dinesh", "Aaridran", "Aari", "Oviyanathan", "Kayilan", "Muthuselvam", "Nandha", "Barani", "Bhuvaneshwar", "Ethiraj", "Iswar", "Abishanth", "Ahivanan", "Varun", "Perarasunathan", "Idhayathullah", "Manickavasagam", "Aaran", "Jeganath", "Dheekshith", "Mahalingam", "Pradhoshraj", "Elavarasu", "Neel", "Rameshraj", "Rathishkumar", "Dhibak", "Jayachandran", "Deepanraj", "Divyanth", "Rajasekaran", "Kadhiresan", "Madhu", "Kaviyan", "Boopalan", "Chokkalingam", "Kathirvelu", "Agarayan", "Sakthi", "Ezhilarasan", "Darshanraj", "Arumugam", "Karikalan", "Chellapandian", "Dhashwanth", "Mahendran", "Lakshmipathi", "Nivashraj", "Madheshwar", "Karunai", "Rithvik", "Boopathi", "Pritivraj", "Gunaaselan", "Gnanavelu", "Jaikumar", "Keerthivasan", "Narendran", "Karunakaran", "Parithimalar", "Kayilan", "Rishwanthraj", "Purushoth", "Kiran", "Gurubalan", "Chithanyan", "Muthu", "Rajan", "Aruljyothi", "Indrajith", "Aandavar", "Karikalan", "Prem", "Dheeraj", "Palaniraj", "Harimurugan", "Dheenadhayalan", "Nimalraj", "Gunalan", "Dhashwin", "Chandru", "Ezhilarasu", "Deveshwar", "Ramachandran", "Kalairaj", "Akshath", "Parthiban", "Manojkumar", "Dilip", "Lokesh", "Rahulraj", "Natarajan", "Prasadraj", "Hemanthkumar", "Bhargav", "Sambath", "Jothimanickam", "Mugilarasan", "Janush", "Guhanathan", "Charun", "Arulmoli", "Aahanyan", "Nimalan", "Amudhanathan", "Azhagar", "Aadhimithran", "Sakthivel", "Manoj", "Nakulan", "Rakeshkumar", "Kalai", "Athvith", "Eashwaran", "Kalaichelvan", "Mathi", "Gowrishankar", "Arun", "Gururajan", "Adhuman", "Gayan", "Akilan", "Arulnambi", "Sabari", "Elango", "Maheshwaran", "Azhagunithi", "Jayamurugan", "Maranraj", "Jithu", "Kasiviswanathan", "Prathapraj", "Mathavan", "Anish", "Shravan", "Gunasekaran", "Gowrikar", "Kamalesh", "Nithilan", "Ayyappan", "Prasad", "Chellapandian", "Krishivraj", "Gurumoorthy", "Arjun", "Ahilanathan", "Anumithran", "Rithvikraj", "Roshan", "Harivignesh", "Gurubaran", "Aagash", "Annamalai", "Gagan", "Komagan", "Alagan", "Heshwin", "Eshwarraj", "Gopinath", "Ilaiya", "Arunprakash", "Kasirajan", "Anbuchelvan", "Cheranraj", "Janahan", "Dhilipkumar", "Krithik", "Jayaguru", "Aadhiran", "Niven", "Ajit", "Hari", "Navin", "Gajapathi", "Anirudh", "Balasuriya", "Gaven", "Avinashraj", "Anush", "Indrajith", "Moulishwar", "Raghuvaran", "Saman", "Abinesh", "Dharanidharan", "Abhisaran", "Mayan", "Dilipan", "Anand", "Gnanamani", "Niharraj", "Hemesh", "Sai", "Agneesh", "Ezhilmaran", "Gurudev", "Arunkumar", "Dushyanth", "Aswanth", "Praneethkumar", "Rohith", "Arush", "Iyappan", "Dhyan", "Rathish", "Rajadurai", "Jagdish", "Devaprasanth", "Durai", "Giridharan", "Prakash", "Amutharasan", "Iyappanraj", "Guruprakash", "Janahan", "Ganeshkumar", "Kumareshraj", "Chanakyan", "Marudhan", "Jaidev", "Nethran", "Javeesh", "Raghavan", "Aadhidev", "Bhuvanesh", "Abhinav", "Aadvikraj", "Ilampari", "Durairaj"
];

const FEMALE_NAMES = [
    "Charusree", "Jeyanthi", "Janaki", "Dhanya", "Hasini", "Meera", "Sumathi", "Kavika", "Nithyasree", "Idhaya",
    "Lipika", "Kala", "Indira", "Ishika", "Poonam", "Sujatha", "Haritha", "Jnanika", "Amutha", "Iraivi",
    "Maanasa", "Bhavadhaarini", "Chandrika", "Isaimani", "Ashwika", "Ezhilovya", "Madhura", "Nethra", "Mohana", "Sathyaabama",
    "Elakiya", "Gokila", "Ashna", "Pavithra", "Anupriya", "Barkavi", "Kalaichudar", "Jashvika", "Gajalila", "Aaral",
    "Sneha", "Ezhilarasi", "Rishika", "Grishma", "Charu", "Padmavathy", "Abhirami", "Nithika", "Jayani", "Ilakkiya",
    "Bavana", "Rupini", "Hrithika", "Meru", "Inbarasi", "Amara", "Anushya", "Janushri", "Spandana", "Kanishka",
    "Jhanvi", "Chinmayi", "Geetha", "Aara", "Arulselvi", "Anushree", "Nila", "Mythili", "Rakshaya", "Ezhinovia",
    "Rakshana", "Ilavanchi", "Prathiba", "Kamatchi", "Charulatha", "Athira", "Aswathi", "Sravya", "Bhumika", "Ahiri",
    "Aadhirai", "Dhivya", "Shifana", "Lisha", "Devaki", "Jeevajothi", "Eviya", "Sudharsini", "Dalini", "Kanmani",
    "Kanya", "Shruthi", "Kanimozhi", "Hiranya", "Kanimathi", "Aarathya", "Dhanu", "Amanya", "Dharshini", "Meghala",
    "Kamali", "Dhananya", "Hiral", "Srinidhi", "Ramya", "Ashvatha", "Bavithra", "Chellamma", "Srimathi", "Sanvi",
    "Kumudha", "Sudharshana", "Jiya", "Amudhini", "Jeevitha", "Avani", "Meena", "Harini", "Jeyashree", "Sumitra",
    "Ashvitha", "Sujitha", "Agneya", "Gowshika", "Narmadha", "Monisha", "Anbarasi", "Charumathi", "Dheekshitha", "Arunthathi",
    "Ekadhani", "Avantika", "Sarojini", "Kayal", "Shreenidhi", "Shree", "Bhuvana", "Dhunisha", "Adhira", "Devanayagi",
    "Nidhi", "Jony", "Bhavanya", "Leela", "Indhumathi", "Aamuktha", "Mayuri", "Agrima", "Dakshina", "Elampirai",
    "Neha", "Swathi", "Deepika", "Nilavazhagi", "Archana", "Sahana", "Heshika", "Jeevika", "Alagumathi", "Magizhi",
    "Ineshika", "Eshwari", "Subiksha", "Ashwini", "Dharanika", "Anamika", "Meenakshi", "Malavika", "Raveena", "Rakshitha",
    "Anvitha", "Jenani", "Neeraja", "Avni", "Angala", "Shilpa", "Aananya", "Gathika", "Jeyam", "Anathi",
    "Shravey", "Jayany", "Dakshita", "Hemini", "Malarvizhi", "Deshika", "Prasanna", "Hemamalin", "Keerthana", "Iyalnila",
    "Alagana", "Dhanalakshmi", "Bhuvi", "Ranjitha", "Gouri", "Amirthavarshini", "Prerana", "Srisha", "Dhanyasree", "Devatha",
    "Bhavitha", "Kanaka", "Harshitha", "Aradhana", "Jeyalakshmi", "Sailaja", "Gnanakumari", "Amuki", "Niranjana", "Mridula",
    "Amudha", "Iraniya", "Pranathi", "Anavi", "Devapriya", "Ithika", "Dheenika", "Aathmika", "Adharshana", "Mithra",
    "Shenbagam", "Akshita", "Bavanisha", "Aaradhya", "Punitha", "Jothirmayi", "Chaitra", "Jeya", "Shubha", "Subhashini",
    "Nalini", "Jashitha", "Riddhi", "Haripriya", "Choreshwari", "Harshada", "Jenisha", "Arivunila", "Abhinaya", "Madhavi",
    "Sunanda", "Lakshitha", "Dharshana", "Dhivyadharshini", "Iyal", "Surekha", "Priyanka", "Karuna", "Ipsha", "Beryl",
    "Gajalakshmi", "Aakalya", "Bala", "Danushree", "Aahna", "Shravani", "Deepasree", "Bhavasri", "Sharmila", "Avinashini",
    "Amarni", "Elilarasi", "Jeevana", "Chitra", "Akshaya", "Dhritika", "Jalaja", "Janshika", "Manasi", "Mahalakshmi",
    "Bilahari", "Anuradha", "Padma", "Deekshitha", "Bhavana", "Kalaimagal", "Sunitha", "Iyali", "Keerthika", "Sasirekha",
    "Shyamala", "Ashmitha", "Sathana", "Kadambari", "Balambika", "Janhavi", "Bhuvaneshwari", "Aganya", "Anitha", "Lika",
    "Agna", "Anbuchelvi", "Ashvini", "Dakshana", "Devadarshini", "Athulya", "Kavinaya", "Neelambari", "Azhagi", "Sivani", "Hitesha", "Isiri", "Akshika", "Poorna", "Deepalakshmi", "Suvetha", "Naadiya", "Ilampoorani", "Chella", "Lavanya",
    "Iniyaval", "Ishanya", "Alamelu", "Jaisree", "Hoshika", "Suhashini", "Manasa", "Karunya", "Dhaksha", "Jothisree",
    "Revathi", "Aruni", "Sruthi", "Kamaleshwari", "Ayushi", "Ineya", "Sharmi", "Anugraha", "Surabhi", "Kamitha",
    "Nadhira", "Ishita", "Darshana", "Megna", "Bhargavi", "Githa", "Kathambari", "Nimisha", "Anya", "Chandra",
    "Jyothika", "Sindhu", "Saritha", "Aadhishree", "Sharmitha", "Selvi", "Maithili", "Bhavini", "Nirupama", "Janishka",
    "Bavatharani", "Ahalya", "Sivagami", "Anjali", "Shivani", "Jenitha", "Jyotsna", "Ival", "Avanya", "Suganya",
    "Adithi", "Gnanam", "Sahithya", "Lakshana", "Atshaya", "Dhanushree", "Aaleya", "Santhiya", "Sreekala", "Hema",
    "Nirmala", "Ishwarya", "Indrani", "Bhairevi", "Durga", "Bindhu", "Ayana", "Rashmi", "Kallarani", "Antara",
    "Athika", "Anaika", "Eshani", "Girija", "Rathika", "Inshika", "Abithira", "Amari", "Radha", "Poovarasi",
    "Gagana", "Hemitha", "Kalaiwani", "Abirami", "Mangai", "Adhiya", "Anuvidha", "Aparna", "Aaridhya", "Amritha",
    "Sarika", "Abhinivesha", "Subhalakshmi", "Sathya", "Indhupriya", "Isaivani", "Seetha", "Greeshma", "Dhenuka", "Charani",
    "Sobia", "Pragathi", "Aridra", "Nisha", "Hansini", "Harisree", "Garima", "Oviya", "Chitrani", "Alari",
    "Prathiksha", "Saranya", "Arthi", "Anupama", "Shrutika", "Arivumani", "Bhagya", "Alisha", "Bhavya", "Eniya",
    "Rupa", "Ekanta", "Santhini", "Janani", "Ishani", "Aathvika", "Dhaksheshwari", "Chaarvi", "Dharanya", "Kalpitha",
    "Jaganya", "Shakthi", "Kamini", "Deepthi", "Jasvitha", "Arushi", "Geethika", "Amuthini", "Kavini", "Aahanya",
    "Annapoorani", "Manjari", "Sashti", "Sanjita", "Ambika", "Gunavathy", "Arunima", "Swetha", "Hemani", "Hridaya",
    "Dheena", "Aaritha", "Pooja", "Gurupriya", "Sheela", "Manimegalai", "Jowshika", "Sushmitha", "Hemapriya", "Bavani",
    "Nandhini", "Geethanjali", "Kanjani", "Tamizh", "Gnanasri", "Adhvikha", "Gita", "Sanjana", "Anuvardhini", "Chaitanya",
    "Advika", "Punya", "Somya", "Semmalar", "Magathi", "Balasree", "Ilavarasi", "Banumathi", "Deivani", "Akalvika",
    "Damayanthi", "Shalini", "Anjika", "Samanya", "Charunila", "Isai", "Ganeshwari", "Elina", "Ahila", "Geethalakshmi",
    "Manju", "Darshini", "Amala", "Amshini", "Amrutha", "Gowri", "Anishka", "Abhisri", "Yazhmozhi", "Aashini",
    "Ashwanthi", "Kayalvizhi", "Sivaranjani", "Janani", "Iniya", "Gajanani", "Chezhiya", "Isharya", "Janany", "Supriya",
    "Mallika", "Surya", "Krithika", "Anjana", "Nivetha", "Prisha", "Shaini", "Janisha", "Diyasree", "Aditi",
    "Aadhavi", "Hiyashree", "Anunidhi", "Preethi", "Aaravi", "Harshana", "Mullai", "Sandhya", "Bhavika", "Ilanagai",
    "Ananya", "Aarna", "Mukthi", "Shreemathi", "Gilda", "Chithralekha", "Gayathri", "Diya", "Dhriti", "Anika",
    "Alagammai", "Shashini", "Sushma", "Gargi", "Sasikala", "Kalpana", "Sayana", "Bharani", "Dakshatha", "Suchitra",
    "Charani", "Sree", "Ayini", "Nithya", "Samyuktha", "Ganavi", "Bhavani", "Kushali", "Hyndhavi", "Hemalatha",
    "Kavia", "Deepadharshini", "Sowmya", "Angayar", "Darani", "Prema", "Reshma", "Inima", "Gowsalya", "Neela",
    "Rathna", "Abira", "Menaka", "Gunalatha", "Bhadra", "Mownika", "Ashwina", "Lokeshwari", "Anusha", "Jeyadharshini",
    "Shanthi", "Hasrika", "Monishree", "Pavithrasree", "Aadshaya", "Sindhuja", "Komathi", "Aiswarya", "Indhu", "Madhumitha",
    "Kadhambari", "Rishmitha", "Suvarna", "Chandini", "Aamani", "Janyasri", "Rukmani", "Rubika", "Nandhana", "Dhurvashini",
    "Naveena", "Agila", "Sharu", "Logitha", "Aruna", "Sukanya", "Brindha", "Deepshika", "Raagini", "Poornima",
    "Kalavathi", "Savitha", "Tamilarasi", "Kannagi", "Sharanya", "Banu", "Hemavathy", "Jaganmayi", "Anbumalar", "Jshitha",
    "Anumathi", "Keerthi", "Gulika", "Sudha", "Manjusree", "Aaradhna", "Dheeksha", "Arishree", "Kaniwari", "Roshini",
    "Avanthika", "Aanandhi", "Harika", "Aritha", "Rubini", "Chellam", "Navaneetha", "Ezhilmangai", "Aarthika", "Dhivyashree",
    "Navya", "Roja", "Eniyaval", "Nilani", "Dhwani", "Malathi", "Rithika", "Devayani", "Nirosha", "Jyothi",
    "Ashini", "Kruthika", "Eksha", "Iraimathi", "Kalaiselvi", "Humshika", "Easwari", "Devi", "Mathivathani", "Pragya",
    "Chakrika", "Harshini", "Shwetha", "Sadhana", "Pavalam", "Aarini", "Kavisri", "Gopika", "Dayana", "Isana",
    "Aathini", "Bhairavi", "Radhika", "Sakshi", "Ira", "Swarna", "Ezhilmalar", "Kamudha", "Aanya", "Gauthami",
    "Shailaja", "Kiruba", "Dheepthi", "Angai", "Nishanthi", "Amirthini", "Deepana", "Namitha", "Niharika", "Gini",
    "Deepti", "Jeyapratha", "Aarathi", "Ishanika", "Agamya", "Prarthana", "Dushani", "Kundhavi", "Mithila", "Dheekshanya",
    "Eshita", "Charuvi", "Kavya", "Lakshmi", "Heera", "Sreemathi", "Madhushree", "Kavi", "Reva", "Arivazhagi",
    "Ezhilmulla", "Akshara", "Jeyasree", "Ipshika", "Sapna", "Mukuntha", "Sangeetha", "Ipitha", "Hemadharshini", "Amirdha",
    "Ahana", "Nagalakshmi", "Hemashree", "Aghanya", "Adishree", "Elili", "Aarunidhi", "Indu", "Kasthuri", "Eshanya",
    "Nakshatra", "Mudra", "Nivethitha", "Kalaiarasi", "Anmulla", "Sunidha", "Draupadi", "Senbagam", "Rashmika", "Manisha",
    "Aarushi", "Akshatha", "Avanthini", "Kanyashree", "Harshree", "Dhithya", "Abhigna", "Maheswari", "Dhanika", "Athmika",
    "Sridevi", "Nivi", "Gomathi", "Jayapriya", "Dhanushya", "Panimalar", "Padmapriya", "Arundhathi", "Rithu", "Ivana",
    "Agalya", "Abaya", "Aashika", "Kaviya", "Gamya", "Adhithri", "Lekha", "Samanvi", "Subha", "Hruthika",
    "Anjalai", "Chamundeswari", "Dwaraka", "Dheepshika", "Aaryahi", "Dhanasree", "Geethasree", "Shamili", "Beena", "Janu",
    "Maya", "Mouli", "Chandana", "Inika", "Malar", "Rakshita", "Adhithi", "Sobana", "Bhavatha", "Nayana",
    "Manjula", "Ranjani", "Cheranila", "Abhimathi"
];

// --- HELPER FUNCTIONS ---

const getInitialWeights = (items: FormItem[]) => {
    const w: Record<string, any> = {};
    items.forEach(item => {
        if (item.type === QuestionType.MULTIPLE_CHOICE || item.type === QuestionType.DROPDOWN) {
            if (item.options && item.options.length > 0) {
                const share = 100 / item.options.length;
                const iw: Record<string, number> = {};
                item.options.forEach(o => iw[o.id || o.label] = share);
                w[item.id] = iw;
            }
        } else if (item.type === QuestionType.CHECKBOXES) {
            if (item.options && item.options.length > 0) {
                const iw: Record<string, number> = {};
                item.options.forEach(o => iw[o.id || o.label] = 50);
                w[item.id] = iw;
            }
        } else if (item.type === QuestionType.LINEAR_SCALE) {
            const start = item.scaleStart || 1;
            const end = item.scaleEnd || 5;
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            const share = 100 / range.length;
            const iw: Record<string, number> = {};
            range.forEach(v => iw[v.toString()] = share);
            w[item.id] = iw;
        }
    });
    return w;
};

const getInitialGridConfigs = (items: FormItem[]) => {
    const c: Record<string, boolean> = {};
    items.forEach(item => {
        if (item.type === QuestionType.MULTIPLE_CHOICE_GRID) {
            c[item.id] = !!item.limitOneResponsePerColumn;
        }
    });
    return c;
};

// --- BATCH GENERATION LOGIC ---

// 1. Single Choice (MCQ, Dropdown, Scale) - Mutually Exclusive, Sums to 100%
const generateBatchForSingleChoice = (
    total: number,
    weights: Record<string, number>
): string[] => {
    if (!weights) return Array(total).fill("");

    let planned: string[] = [];
    const entries = Object.entries(weights);

    // A. Fill based on exact counts
    entries.forEach(([label, w]) => {
        const count = Math.floor((w / 100) * total);
        for (let i = 0; i < count; i++) planned.push(label);
    });

    // B. Fill remainder
    // Use the highest weighted option to fill gaps (Deterministic fallback)
    const sortedByWeight = entries.sort((a, b) => b[1] - a[1]);
    const fallback = sortedByWeight.length > 0 ? sortedByWeight[0][0] : "N/A";

    while (planned.length < total) {
        planned.push(fallback);
    }

    // C. Shuffle
    return planned.sort(() => Math.random() - 0.5);
};

// 2. Checkboxes - Independent Probabilities per Option
const generateBatchForCheckboxes = (
    total: number,
    weights: Record<string, number>
): string[][] => {
    if (!weights) return Array.from({ length: total }, () => []);

    // Initialize batch as array of empty arrays
    const batch: string[][] = Array.from({ length: total }, () => []);

    Object.entries(weights).forEach(([label, w]) => {
        // Determine how many times THIS option should appear across the batch
        const count = Math.floor((w / 100) * total);

        // Create an array of true/false for this option
        const optionOccurrence = Array(total).fill(false);
        for (let i = 0; i < count; i++) optionOccurrence[i] = true;

        // Shuffle where this option appears
        optionOccurrence.sort(() => Math.random() - 0.5);

        // Assign to the master batch
        optionOccurrence.forEach((isSelected, idx) => {
            if (isSelected && batch[idx]) {
                batch[idx].push(label);
            }
        });
    });

    return batch;
};

// --- COMPONENT ---

export const WeightedAutomation: React.FC<WeightedAutomationProps> = ({ form, onBack }) => {
    const { user, refreshCredits } = useAuth();
    const [weights, setWeights] = useState<Record<string, any>>(() => getInitialWeights(form.items));
    const [gridConfigs, setGridConfigs] = useState<Record<string, boolean>>(() => getInitialGridConfigs(form.items));

    // Special Modes: Identify which question is "GENDER" (Source) and which is "NAME" (Target)
    const [specialModes, setSpecialModes] = useState<Record<string, 'GENDER' | 'NAME' | undefined>>({});

    const [targetCount, setTargetCount] = useState(10);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState(0);

    const stopRequested = useRef(false);

    // Helper: Generate a single grid response (Random per submission)
    const generateGridResponse = (item: FormItem) => {
        const result: Record<string, string> = {};
        if (!item.rows || !item.columns) return result;

        const colLabels = item.columns.map(c => c.label);
        const limitOne = gridConfigs[item.id] || false;

        if (limitOne && item.type === QuestionType.MULTIPLE_CHOICE_GRID) {
            // Unique Shuffled
            const shuffled = [...colLabels].sort(() => Math.random() - 0.5);
            item.rows.forEach((row, idx) => {
                if (row.id && idx < shuffled.length) {
                    result[row.id] = shuffled[idx];
                }
            });
        } else {
            // Independent Random
            item.rows.forEach(row => {
                if (row.id) {
                    result[row.id] = colLabels[Math.floor(Math.random() * colLabels.length)];
                }
            });
        }
        return result;
    };

    const handleStart = async () => {
        if (!form.actionUrl) {
            alert("Action URL missing.");
            return;
        }

        setIsRunning(true);
        stopRequested.current = false;
        setLogs([]);
        setProgress(0);
        let successCount = 0;
        let pendingDeductions = 0;

        // --- PHASE 1: PRE-CALCULATE BATCH SCHEDULE ---
        const batchSchedule: Record<string, any[]> = {};

        // 1A. Detect Dependency Linkage
        const genderItem = form.items.find(i => specialModes[i.id] === 'GENDER');
        const nameItem = form.items.find(i => specialModes[i.id] === 'NAME');

        // 1B. If linked, generate Gender FIRST, then derive Names
        if (genderItem && nameItem && weights[genderItem.id]) {
            // Generate the base gender array respecting weights (e.g., 30% Male, 70% Female)
            const genderBatch = generateBatchForSingleChoice(targetCount, weights[genderItem.id]);
            batchSchedule[genderItem.id] = genderBatch;

            // Map the result to names
            batchSchedule[nameItem.id] = genderBatch.map(genderVal => {
                const lower = genderVal.toLowerCase();
                if (lower.includes('female')) {
                    return FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
                } else if (lower.includes('male')) {
                    return MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
                } else {
                    return "N/A"; // Or mixed
                }
            });
        }

        form.items.forEach(item => {
            // Skip if already generated (Gender/Name linkage)
            if (batchSchedule[item.id]) return;

            // 1. Text Fields
            if (item.type === QuestionType.SHORT_ANSWER || item.type === QuestionType.PARAGRAPH) {
                if (item.type === QuestionType.SHORT_ANSWER && specialModes[item.id] === 'NAME') {
                    // Unlinked Name Generation: 60% Male, 40% Female
                    const maleCount = Math.floor(targetCount * 0.6);
                    const femaleCount = targetCount - maleCount;
                    const names: string[] = [];

                    for (let k = 0; k < maleCount; k++) names.push(MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]);
                    for (let k = 0; k < femaleCount; k++) names.push(FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]);

                    // Shuffle
                    batchSchedule[item.id] = names.sort(() => Math.random() - 0.5);
                } else {
                    batchSchedule[item.id] = Array(targetCount).fill("N/A");
                }
            }
            // 2. Grids -> Placeholder (Generated on fly)
            else if (item.type === QuestionType.MULTIPLE_CHOICE_GRID || item.type === QuestionType.CHECKBOX_GRID) {
                batchSchedule[item.id] = [];
            }
            // 3. Single Choice (Weighted)
            else if (
                item.type === QuestionType.MULTIPLE_CHOICE ||
                item.type === QuestionType.DROPDOWN ||
                item.type === QuestionType.LINEAR_SCALE
            ) {
                batchSchedule[item.id] = generateBatchForSingleChoice(targetCount, weights[item.id]);
            }
            // 4. Checkboxes (Weighted Independent)
            else if (item.type === QuestionType.CHECKBOXES) {
                batchSchedule[item.id] = generateBatchForCheckboxes(targetCount, weights[item.id]);
            }
        });



        const performDeduction = async (count: number) => {
            if (user?.role === 'admin') return;
            try {
                const result = await creditsApi.deduct(count);
                setLogs(prev => [{ id: prev.length + 1, status: 'success', message: `💳 ${count} credits deducted incrementally. Remaining: ${result.credits}`, time: new Date().toLocaleTimeString() }, ...prev]);
                refreshCredits();
            } catch (err: any) {
                setLogs(prev => [{ id: prev.length + 1, status: 'error', message: `Incremental credit deduction failed: ${err.error || 'Unknown error'}`, time: new Date().toLocaleTimeString() }, ...prev]);
            }
        };

        // --- PHASE 2: EXECUTION LOOP ---
        for (let i = 0; i < targetCount; i++) {
            if (stopRequested.current) {
                setLogs(prev => [{ id: i, status: 'stopped', message: "Stopped by user", time: new Date().toLocaleTimeString() }, ...prev]);
                break;
            }

            try {
                const formData = new URLSearchParams();

                // Include Security Token if present
                if (form.fbzx) {
                    formData.append('fbzx', form.fbzx);
                }

                // Handle multi-section forms (pageHistory)
                const sectionBreaks = form.items.filter(i => i.isPageBreak).length;
                if (sectionBreaks > 0) {
                    const history = Array.from({ length: sectionBreaks + 1 }, (_, k) => k).join(',');
                    formData.append('pageHistory', history);
                }

                // Add draftResponse for compatibility
                formData.append('draftResponse', '[]');

                form.items.forEach(item => {
                    // A. Grids (Dynamic)
                    if (item.type === QuestionType.MULTIPLE_CHOICE_GRID || item.type === QuestionType.CHECKBOX_GRID) {
                        const gridData = generateGridResponse(item);
                        Object.entries(gridData).forEach(([rowId, val]) => {
                            formData.append(`entry.${rowId}`, val);
                        });
                    }
                    // B. Others (Scheduled)
                    else {
                        const scheduledValue = batchSchedule[item.id]?.[i];
                        if (scheduledValue !== undefined && item.submissionId) {
                            if (Array.isArray(scheduledValue)) {
                                // Checkboxes
                                scheduledValue.forEach(val => formData.append(`entry.${item.submissionId}`, val));
                            } else {
                                // Single Value
                                formData.append(`entry.${item.submissionId}`, scheduledValue);
                            }
                        }
                    }
                });

                await fetch(form.actionUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });

                setLogs(prev => [{ id: i + 1, status: 'success', message: "Submitted", time: new Date().toLocaleTimeString() }, ...prev]);
                successCount++;
                pendingDeductions++;

                if (pendingDeductions === 5) {
                    await performDeduction(5);
                    pendingDeductions = 0;
                }
            } catch (e) {
                setLogs(prev => [{ id: i + 1, status: 'error', message: "Failed", time: new Date().toLocaleTimeString() }, ...prev]);
            }

            setProgress(i + 1);

            if (i < targetCount - 1 && !stopRequested.current) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (pendingDeductions > 0) {
            await performDeduction(pendingDeductions);
        }

        setIsRunning(false);
    };

    const handleResetWeights = () => {
        if (window.confirm("Reset all settings to default?")) {
            setWeights(getInitialWeights(form.items));
            setGridConfigs(getInitialGridConfigs(form.items));
            setSpecialModes({});
        }
    };

    // Toggle visibility: only one Name and one Gender toggle active at a time
    const activeGenderId = Object.entries(specialModes).find(([_, mode]) => mode === 'GENDER')?.[0];
    const activeNameId = Object.entries(specialModes).find(([_, mode]) => mode === 'NAME')?.[0];

    const renderItem = (item: FormItem, idx: number) => {
        if ([QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN, QuestionType.CHECKBOXES, QuestionType.LINEAR_SCALE].includes(item.type)) {
            const canShowGender = !activeGenderId || activeGenderId === item.id;
            return (
                <motion.div key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.04 * idx, ease: [0.22, 1, 0.36, 1] }}>
                    <WeightedQuestionRenderer
                        item={item}
                        weights={weights[item.id]}
                        onWeightChange={(newW) => setWeights(prev => ({ ...prev, [item.id]: newW }))}
                        specialMode={specialModes[item.id] === 'GENDER' ? 'GENDER' : undefined}
                        onToggleSpecialMode={(mode) => setSpecialModes(prev => ({ ...prev, [item.id]: mode }))}
                        showGenderToggle={canShowGender}
                    />
                </motion.div>
            );
        }

        if (item.type === QuestionType.SECTION_HEADER) {
            return (
                <motion.div key={item.id} className="card p-6 mb-4 text-center"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.04 * idx, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="h-[3px] w-14 mx-auto rounded-full mb-3 bg-gradient-to-r from-[#4285F4] to-[#5a9cf5] opacity-50"></div>
                    <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                    {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}
                </motion.div>
            );
        }

        if (item.type === QuestionType.MULTIPLE_CHOICE_GRID || item.type === QuestionType.CHECKBOX_GRID) {
            const isLimited = gridConfigs[item.id] || false;
            return (
                <motion.div key={item.id} className="card p-6 mb-4"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.04 * idx, ease: [0.22, 1, 0.36, 1] }}>
                    <h4 className="text-[15px] text-gray-800 font-medium mb-4">{item.title}</h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm">
                        <div className="flex items-center text-gray-500">
                            <Shuffle className="w-4 h-4 mr-2 text-[#4285F4]" />
                            {isLimited ? "Shuffle (Unique Column)" : "Random Selection"}
                        </div>
                        {item.type === QuestionType.MULTIPLE_CHOICE_GRID && (
                            <label className="flex items-center cursor-pointer select-none mt-2 sm:mt-0">
                                <input type="checkbox" checked={isLimited}
                                    onChange={(e) => setGridConfigs(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                    className="w-4 h-4 text-[#4285F4] rounded border-gray-300 focus:ring-blue-400"
                                />
                                <span className="ml-2 text-gray-500 text-xs uppercase font-semibold tracking-wide">Limit 1 per col</span>
                            </label>
                        )}
                    </div>
                </motion.div>
            );
        }

        if (item.type === QuestionType.SHORT_ANSWER) {
            const isNameMode = specialModes[item.id] === 'NAME';
            const canShowNameToggle = !activeNameId || activeNameId === item.id;
            return (
                <motion.div key={item.id} className="card p-6 mb-4"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.04 * idx, ease: [0.22, 1, 0.36, 1] }}>
                    <h4 className="text-[15px] text-gray-800 font-medium mb-4">{item.title}</h4>
                    <div className="border-b border-gray-100 pb-2 mb-4">
                        <span className="text-gray-300 text-sm">Short answer text</span>
                    </div>
                    <AnimatePresence mode="wait">
                        {canShowNameToggle && (
                            <motion.label
                                key={`name-toggle-${item.id}`}
                                className="flex items-center cursor-pointer select-none group gap-3"
                                initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                                exit={{ opacity: 0, scale: 1.3, filter: 'blur(12px)', transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
                            >
                                <button type="button" onClick={() => setSpecialModes(prev => ({ ...prev, [item.id]: isNameMode ? undefined : 'NAME' }))}
                                    className={`toggle-track ${isNameMode ? 'active' : ''}`}>
                                    <div className={`toggle-knob ${isNameMode ? 'active' : ''}`} />
                                </button>
                                <span className={`text-xs font-semibold uppercase tracking-wide transition-colors ${isNameMode ? 'text-[#4285F4]' : 'text-gray-400'}`}>
                                    {isNameMode ? "Generating Names" : "Generate Names"}
                                </span>
                            </motion.label>
                        )}
                    </AnimatePresence>
                </motion.div>
            );
        }

        return (
            <motion.div key={item.id} className="card p-6 mb-4 opacity-60"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.4, delay: 0.04 * idx, ease: [0.22, 1, 0.36, 1] }}>
                <h4 className="text-[15px] text-gray-800 font-medium mb-4">{item.title}</h4>
                <div className="border-b border-gray-100 pb-2">
                    <span className="text-gray-300 text-sm">
                        {item.type === QuestionType.PARAGRAPH ? "Long answer text" : "Option 1"}
                    </span>
                </div>
            </motion.div>
        );
    };

    const progressPct = targetCount > 0 ? (progress / targetCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#f8f7fc] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Frosted Navbar */}
            <motion.div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ WebkitBackdropFilter: 'blur(20px)' }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-3 flex items-center">
                    <button onClick={onBack} className="mr-4 text-gray-400 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-50 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[15px] font-semibold text-gray-800">Configure weightage and automate submissions</span>
                    <div className="ml-auto">
                        <button onClick={handleResetWeights} className="text-gray-300 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-all" title="Reset">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Grid Layout */}
            <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start mt-1 relative">
                {/* Questions Column */}
                <div className="space-y-4">
                    {/* Title Card */}
                    <motion.div className="card p-6 relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[14px] bg-gradient-to-b from-[#4285F4] via-[#5a9cf5] to-[#7baaf7]"></div>
                        <div className="pl-4">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">{form.title}</h1>
                            {form.description && (
                                <div className="text-sm text-gray-400 border-t border-gray-50 pt-3 mt-2 whitespace-pre-line leading-relaxed">
                                    {form.description}
                                </div>
                            )}
                        </div>
                    </motion.div>
                    {form.items.map((item, idx) => renderItem(item, idx))}
                </div>

                {/* Sidebar */}
                <div className="lg:sticky lg:top-20 space-y-4">
                    {/* Control Panel */}
                    <motion.div className="card overflow-hidden"
                        initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center">
                            <Sliders className="w-4 h-4 mr-2 text-[#4285F4]" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Automation Control</span>
                        </div>
                        <div className="p-5 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Submissions</label>
                                <input type="number" min="1" max="1000" value={targetCount}
                                    onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                                    disabled={isRunning}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 text-center text-2xl font-bold text-gray-800 outline-none focus:border-[#4285F4]/50 focus:ring-3 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            {!isRunning ? (
                                <button onClick={handleStart}
                                    className="w-full btn-primary font-semibold py-3 rounded-xl flex items-center justify-center text-sm">
                                    <Play className="w-4 h-4 mr-2" fill="currentColor" /> Run Automation
                                </button>
                            ) : (
                                <button onClick={() => stopRequested.current = true}
                                    className="w-full bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 font-semibold py-3 rounded-xl flex items-center justify-center transition-all text-sm">
                                    <Square className="w-4 h-4 mr-2" fill="currentColor" /> Stop
                                </button>
                            )}
                        </div>
                        {/* Spring-animated progress */}
                        <AnimatePresence>
                            {isRunning && (
                                <motion.div className="px-5 pb-5"
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="text-[#4285F4] font-bold">{Math.round(progressPct)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-[#4285F4] to-[#5a9cf5] progress-stripe"
                                            animate={{ width: `${progressPct}%` }}
                                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5 text-center font-medium">{progress} / {targetCount} submitted</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Log Card */}
                    <motion.div className="card overflow-hidden flex flex-col max-h-[320px]"
                        initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                <Zap className="w-3 h-3 mr-1.5 text-amber-400" />Activity Log
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-mono font-bold">{logs.length}</span>
                        </div>
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="p-6 text-center text-gray-300 text-xs italic font-medium">Ready to start...</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {logs.map((log, i) => (
                                        <motion.div key={log.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                            className={`px-5 py-2.5 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors ${i === 0 ? 'bg-blue-50/30' : ''}`}>
                                            <div className="flex items-center">
                                                {log.status === 'success' && i === 0 ? (
                                                    <span className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center mr-2 animate-check-pop">
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </span>
                                                ) : (
                                                    <span className={`w-2 h-2 rounded-full mr-2.5 ${i === 0 ? 'dot-new' : ''} ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'error' ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                                                )}
                                                <span className="text-gray-600 font-medium">#{log.id}</span>
                                                <span className={`ml-2 ${log.status === 'success' ? 'text-emerald-500' : log.status === 'error' ? 'text-red-500' : 'text-amber-500'}`}>{log.message}</span>
                                            </div>
                                            <span className="text-gray-300 font-mono text-[10px]">{log.time}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
