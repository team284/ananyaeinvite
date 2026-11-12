/* =================================================================
   EDIT THIS BLOCK for each couple. All times are IST.
   Personalise a guest's link by adding  #the-sharma-family  to the URL:
   the envelope is addressed to them and the RSVP is pre-filled.
   Photos: put image URLs (or data: URIs) in photos[].src.
   ================================================================= */
window.CONFIG = {
  bride:"Ananya", groom:"Kabir",
  brideFull:"Ananya Kapoor", groomFull:"Kabir Malhotra",
  brideParents:"Smt. Ritu & Shri Rajiv Kapoor", groomParents:"Smt. Meera & Shri Sanjay Malhotra",
  /* Venue picture (leave empty to use the drawn palace) and the background music: one file or a list played in turn (leave empty to hide the music button) */
  venueImg:"photos/venue/palace.jpg", music:"assets/rajasthani-folk.mp3",
  city:"Udaipur", venue:"Jharokha Mahal, Lake Pichola", address:"Gangaur Ghat Road, Udaipur, Rajasthan", mapsQuery:"Lake Pichola Udaipur",
  mainDate:{day:"14", month:"February", year:"2027", line:"Sunday · 7:00 PM", sub:"By Lake Pichola, with dinner after the pheras"},
  story:[
    {city:"Delhi", when:"Lohri 2020", art:"delhi", img:"photos/story/delhi.jpg", stamp:"#8c2a34",
     text:"Two strangers at a college friend's Lohri, a short walk from India Gate. One bonfire, one long argument about the best gajak, and a number saved as 'Gajak Girl'."},
    {city:"Mumbai", when:"Monsoon 2022", art:"mumbai", img:"photos/story/mumbai.jpg", stamp:"#5b6b2c",
     text:"Kabir moved to Mumbai. Midnight walks on Marine Drive with Ananya on video call, the Gateway lit behind him, and a drawer full of Rajdhani tickets."},
    {city:"Udaipur", when:"Diwali 2025", art:"udaipur", img:"photos/story/udaipur.jpg", stamp:"#3a0b12",
     text:"A boat on Lake Pichola at sunset. He asked, and she said yes before he finished. So we're bringing everyone back to the same lake."}
  ],
  /* Solo portraits beside the envelope (3:4 portrait works best). Leave src empty to hide them. */
  couple:{groom:"photos/couple/groom.jpg", bride:"photos/couple/bride.jpg"},
  /* capOnPhoto: the caption is already written on the picture, so none is added on top */
  photos:[
    {cap:"First trip, Delhi market", src:"photos/moments/first-trip.jpg", capOnPhoto:true},
    {cap:"Lake boating, Udaipur", src:"photos/moments/lake-boating.jpg", capOnPhoto:true},
    {cap:"The day he asked", src:"photos/moments/the-day-he-asked.jpg", capOnPhoto:true},
    {cap:"Roka", src:"photos/moments/roka.jpg", capOnPhoto:true}
  ],
  /* Illustrations for the three functions; w and h are the image size in pixels. */
  scenes:{
    mehendi:{src:"photos/events/mehendi.jpg", w:1100, h:1063, alt:"A mehendi artist's hand drawing henna on the bride's palm by Lake Pichola"},
    sangeet:{src:"photos/events/sangeet.jpg", w:1100, h:1364, alt:"A drummer's hands playing the dhol while the bride's mehendi hands dance behind"},
    vivah:{src:"photos/events/vivah.jpg", w:1100, h:1364, alt:"The bride's hand in the groom's, tied with the gathbandhan above the sacred fire"}
  },
  events:[
    {key:"mehendi", hi:"मेहंदी", en:"Mehendi", act:"Act I", tag:"Rang laayegi mehendi",
     start:"2027-02-12T16:00:00+05:30", hours:5, place:"The Garden Courtyard",
     copy:"Henna artists, marigold swings, chaat counters and the dholki going all evening. Come with empty hands, leave with patterns.",
     dress:"Olive greens with soft baby pink", sw:["#5b6b2c","#ecbcb4","#f6e3b4"]},
    {key:"sangeet", hi:"संगीत", en:"Sangeet", act:"Act II", tag:"Dhol bajega, sab nachenge",
     start:"2027-02-13T19:30:00+05:30", hours:5, place:"The Lakeside Terrace",
     copy:"Both families take the stage. The rehearsals have already started in two cities, and the bride's side is not holding back. Bring your best steps.",
     dress:"Dusty rose and deep burgundy, with a little sparkle", sw:["#8c2a34","#3a0b12","#ecbcb4"]},
    {key:"vivah", hi:"शुभ विवाह", en:"The Wedding", act:"Act III", tag:"Saat phere, saath hamesha",
     start:"2027-02-14T19:00:00+05:30", hours:5, place:"The Mandap by the Lake",
     copy:"Under the stars on the ghats of Lake Pichola, with the pheras at the auspicious hour and dinner after.",
     dress:"Traditional Indian in burgundy, rose or ivory", sw:["#3a0b12","#8c2a34","#f6e3b4"]}
  ],
  travel:[
    ["plane","Getting here","Maharana Pratap Airport (UDR) is 40 minutes away. Cars will meet every flight on the 11th and 12th."],
    ["train","By train","Udaipur City station is 20 minutes from the Mahal. Tell us your train and we'll be there."],
    ["stay","Where to stay","The family wing of the Mahal is held for you from the 11th to the 15th."]
  ],
  elders:["Late Smt. Kamla Devi & Shri Ram Prasad Kapoor","Smt. Shanti & Shri Om Prakash Malhotra"],
  rsvpBy:"Tell us how many of you are coming to each function, by 20 January.",
  whatsapp:"919876500000",
  families:"the Kapoor & Malhotra families"
};
var CONFIG = window.CONFIG;
