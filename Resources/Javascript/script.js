window.onload = function(){

    //afisarea setarii de light/dark din local storage
    document.body.className = localStorage.getItem("theme")
    //afisarea pentru prima oara a butonului, relativ la ultima setare
    document.getElementById("light_dark").childNodes[1].className = (document.body.className == "light") ? "fas fa-moon" : "fas fa-sun";
    document.getElementById("light_dark").childNodes[0].textContent = (document.body.className == "light") ? "Dark" : "Light";

    var menuLinks = document.querySelectorAll("ul.menu a")
    var currentPath = window.location.pathname
    var pathHash = window.location.hash

    currentPath = (currentPath== "/") ? "/index":currentPath

    for(var link of menuLinks){
        
        if(link.href.endsWith(currentPath)){
            link.style.backgroundColor =  "limegreen";
        }
          
        link.onclick = function(){
            var ch_menu = document.getElementById("ch-menu")
            ch_menu.checked = false
            var ch_submenu = document.getElementById("submenu_galleries")
            ch_submenu.checked = false        
        }

        //selectez doar linkurile catre sectiuni interne in pagina 
		var linkuriInterne=document.querySelectorAll("ul.menu a[href*='#']");
        console.log(linkuriInterne.length);
    
        //---------------pentru SCROLL ANIMAT
        for (var lnk of linkuriInterne ){
            //linkurilor interne le asociez un eveniment la click
            //vreau sa verifica daca linkurile sunt in aceeasi pagina
            var paghref=lnk.href.substring(lnk.href.lastIndexOf("/"),lnk.href.lastIndexOf("#"))
            var locationhref=window.location.href
            var paglocation=locationhref.substring(locationhref.lastIndexOf("/"),locationhref.lastIndexOf("#"))
            //fac scroll animat doar daca sunt in aceeasi pagina
            if(paglocation==paghref)
                lnk.onclick= clickLink
        }
    }


    //-----------------SCROLL ANIMAT
    //folosit in setInterval-ul care realizeaza scroll-ul animat
    var idIntervalPlimbare=-1;

    function clickLink(ev){ 
    ev.preventDefault()//opresc actiunea default (browserul se ducea singur la locatia linkului, dar noi vrem sa se duca animat pana acolo)
    
    //opresc o animatie existenta
    clearInterval(idIntervalPlimbare)
    var ch
    var lnk=ev.target
    //ascunderea submeniului la click
    if(lnk.parentNode.parentNode.classList.contains("submenu")){
        var checkboxes=document.getElementsByClassName("ch-submenu")
        for(ch of checkboxes)
        ch.checked=false
    
        document.getElementById("ch-menu").checked=false
    }
    else if(lnk.parentNode.parentNode.classList.contains("menu")){
        document.getElementById("ch-menu").checked=false
    }
    
    var coordScroll;
    var poz=lnk.href.indexOf("#");
    var idElemScroll=lnk.href.substring(poz+1);
    if(idElemScroll==""){
        coordScroll=0;
    }
    else{
        coordScroll=getOffsetTop(document.getElementById(idElemScroll))//eventual scad inaltimea meniului, ca sa nu fie titlul sectiunii acoperit de meniu
    }
    var distanta=coordScroll-document.documentElement.scrollTop
    console.log(distanta)
        //stabilesc pasul de scroll, pozitiv sau negativ in functie de directia de scroll
    pas=distanta<0 ?-20:20;
        //pornesc un setInterval care la fiecare 10ms va da un scroll cu 20px pana ajunge la destinatie, realizand astfel animatia
    //ultimul parametru transmis functiei plimba este ceea ce vine dupa # in link, de exemplu pentru "pagina.html#abc", se transmite doar "abc"
        idIntervalPlimbare=setInterval(plimba,10,pas,coordScroll,lnk.href.substring(lnk.href.lastIndexOf("#")+1))
    }
    
    /*functia merge din parinte in parinte adunand offseturile(spatiile de la granita de sus a elementului fiu la granita de sus a elementului parinte), pentru a obtine offsetTop-ul fata de pagina*/ 
    function getOffsetTop(elem){
    var rez = elem.offsetTop;
    while (elem.offsetParent && elem.offsetParent != document.body) {
        elem = elem.offsetParent;
        rez += elem.offsetTop;
    } return rez;
    
    }
    
    function plimba(pas,coordScroll, href){
        //daca incerc sa incrementez scrollTop cand e deja la finalul ferestrei, acesta nu isi va schimba valoarea
        //deci pot sa testez daca e la final comparand scrollVechi cu scrollTop dupa incrementare
        scrollVechi=document.documentElement.scrollTop;
    document.documentElement.scrollTop+=pas
        /*am trei cazuri
        - pasul e pozitiv si deci merg in jos, asadar daca scrollTop e egal sau a depasit in jos coordonata la care doream sa ajung, ma opresc
        - pasul e negativ si deci merg in sus, asadar daca scrollTop e egal sau a depasit in sus coordonata la care doream sa ajung, ma opresc
        - sunt la un capat de pagina, si scrolltop nu se mai modifica desi il incrementez/decrementez, (verifc asta comparandu-l cu scrollTop-ul vechi)
        */
    if(pas>0 && coordScroll<=document.documentElement.scrollTop || pas<0 && coordScroll>=document.documentElement.scrollTop || scrollVechi==document.documentElement.scrollTop){
            //opresc animatia
        clearInterval(idIntervalPlimbare)
            //schimb in bara de adrese astfel incat sa se vada sectiunea la care am ajuns
            window.location.hash=href
        }
    }

    //-----------------------LIGHT DARK
    document.getElementById("light_dark").onclick = function(){
        document.body.className = (document.body.className == "light") ? "dark": "light";

        var moon_sun = document.getElementById("light_dark").childNodes[1].className;
        document.getElementById("light_dark").childNodes[1].className = (document.body.className == "light") ? "fas fa-moon" : "fas fa-sun";
        document.getElementById("light_dark").childNodes[0].textContent = (document.body.className == "light") ? "Dark" : "Light";
        
        var light_dark = document.body.className
        localStorage.setItem("theme", light_dark)
    }

    //------------------------------ setare Boolean yes/No
    var hotels = document.querySelectorAll("#gr_hotels article.hotel")
    for(var hotel of hotels){
        var wifi = hotel.getElementsByClassName("wifi")[0].childNodes[1].textContent
        console.log(wifi)
        if(wifi == 0){
            hotel.getElementsByClassName("wifi")[0].childNodes[1].textContent = "No"
        }
        else {
            hotel.getElementsByClassName("wifi")[0].childNodes[1].textContent = "Yes"
        }

        // afisare categorie fara underline
        var category = hotel.getElementsByClassName("category")[0].childNodes[1].textContent
        if(category == "extreme_hotel"){
            hotel.getElementsByClassName("category")[0].childNodes[1].textContent = "extreme hotel"
        }
        if(category == "luxury_hotel"){
            hotel.getElementsByClassName("category")[0].childNodes[1].textContent = "luxury hotel"
        }


        //DEBUG
        //console.log(hotel.getElementsByClassName("price")[0].childNodes[1].textContent);
        var price_text = hotel.getElementsByClassName("price")[0].childNodes[1].textContent
        var price = price_text.split(" ")[0]
        console.log("PRET actual:" + price)

        //---------------------SETARE format DATE
        var start_date = new Date(hotel.getElementsByTagName("time")[0].innerHTML)
        var days = ["Monday", "Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        var months = ["January", "February", "March", "April","May", "June","July","August","September","October","November","December"]

        var date_format = start_date.getDate() + " " + months[start_date.getMonth()] + " " + start_date.getFullYear() + " [" + days[start_date.getDay()] + "]"
        hotel.getElementsByTagName("time")[0].innerHTML = date_format
    }

    //-------------------BUTOANE FILTRARE/SORTARE/CALCUARE
    if(document.getElementById("input_filter")){

        document.getElementById("input_filter").onclick=function(){
            var region_selected = document.getElementById("i_region").value.toLowerCase()
            if(region_selected != "every region" && region_selected != "transilvania" && region_selected != "dobrogea" 
                 && region_selected != "muntenia" && region_selected != "moldova" && region_selected != "maramures" 
                 && region_selected != "banat" && region_selected != "crisana" && region_selected != "oltenia"){
                         alert("Please enter an existing region!")
            }
     
            var number_stars = document.getElementById("i_stars").value
            var min_price = document.getElementById("simple_select").value
            var options = document.getElementById("multiple_select").options
            var selected_options = []
            var index = 0
            for(var opt of options){
                if(opt.selected){
                     selected_options[index] = opt.value.toLowerCase()
                     index = index + 1
                }
            }
            var checks = document.getElementsByName("category_check")
            var categories = []
            index = 0;
            for(var ch of checks){
                if(ch.checked){
                     categories[index] = ch.value
                     index = index + 1
                }
            }
            if(index == 0){
                alert("Please select at least one category!")
            }
     
            var radios = document.getElementsByName("wifi_radio")
            var selected_wifi = 2
            for(var radio of radios){
                if(radio.checked){
                     selected_wifi = radio.value
                     break
                }
            }
            console.log("WIFI SELECTAT:"+selected_wifi)
     
     
            var keywords = document.getElementById("i_textarea").value.toLowerCase()
            keywords = keywords.split(/[\s,]+/)
            
            function hasNumber(myString) {
             return /\d/.test(myString);
           }
            //DEBUG
            for(var text of keywords){
                console.log("/"+text+"/")
                if(hasNumber(text) == true){
                    alert("The keywords from textarea must not contain numbers!")
                }
            }
            
            var hotels = document.querySelectorAll("#gr_hotels article.hotel")
             for(var hotel of hotels){
                 hotel.style.display = "block"
                 var price_text = hotel.getElementsByClassName("price")[0].childNodes[1].textContent
                 var price = Number(price_text.split(" ")[0])
                 var facilities = hotel.getElementsByClassName("facilities")[0].childNodes[1].textContent.toLowerCase()
                 facilities = facilities.split(", ")
                 var category = hotel.getElementsByClassName("category")[0].childNodes[1].textContent
                 var wifi = hotel.getElementsByClassName("wifi")[0].childNodes[1].textContent
                 wifi = (wifi == "Yes") ? 1:0
                 var description = hotel.getElementsByClassName("description")[0].childNodes[1].textContent.toLowerCase()
     
                 //DEBUG
                 console.log("."+category+".")
                 console.log(price)
                 console.log("---------WIFI:"+ wifi)
     
                 //daca cel putin un cuvant cheie e regasit in descriere, vom afisa hotelul
                 var isOk = false
                 for(var word of keywords){
                     if(description.includes(word)){
                         hotel.style.display = "block"
                         isOk = true
                         break
                     }
                 }
                 //nu s-a gasit niciunul
                 if(isOk == false){
                     hotel.style.display = "none"
                 }
     
                 if(region_selected != "every region" && hotel.getElementsByClassName("region")[0].childNodes[1].textContent.toLowerCase() != region_selected){
                     hotel.style.display = "none"
                 }
                 if(hotel.getElementsByClassName("stars")[0].childNodes[1].textContent != number_stars){
                     hotel.style.display = "none"
                 }
                 if( price < min_price){
                     hotel.style.display = "none"
                     console.log("pret mai mic decat vrea clientul:"+price)
                 }
                 for(opt of selected_options){
                     if(facilities.includes(opt) == false){
                         hotel.style.display = "none";
                         break;
                     }
                 }
                 if(categories.includes(category) == false){
                     hotel.style.display = "none";
                 }
                 //selected_wifi are valoarea 2 pt optiunea de nu conteaza
                 if(selected_wifi != 2 && selected_wifi != wifi){
                     hotel.style.display = "none";
                 }
                 
             }  
         }

         document.getElementById("reset_filter").onclick = function(){
            document.getElementById("i_region").value = "every region"
            document.getElementById("i_stars").value = "5"
            document.getElementById("simple_select").value = 90
            
            var options = document.getElementById("multiple_select").options
            for (var opt of options){
                opt.selected = false
            }
    
            var checks = document.getElementsByName("category_check")
            for(var ch of checks){
                ch.checked = false
            }
    
            var radios = document.getElementsByName("wifi_radio")
            for(var radio of radios){
                radio.checked = false
            }
    
            document.getElementById("i_textarea").value = ""
       
        }
    
        document.getElementById("sort_asc").onclick = function(){
            var container = document.getElementById("gr_hotels")
            //var hotels = container.getElementsByClassName("hotel")
            var hotels = container.children
            //console.log(hotels)
    
            var hotels_array = Array.from(hotels)
            //console.log(hotels_array)
            hotels_array.sort(function(a,b){
                if(a.getElementsByClassName("region")[0].childNodes[1].textContent.localeCompare(b.getElementsByClassName("region")[0].childNodes[1].textContent) == - 1 ){
                    console.log("primul if")
                    return -1;
                }
                if(a.getElementsByClassName("region")[0].childNodes[1].textContent.localeCompare(b.getElementsByClassName("region")[0].childNodes[1].textContent) == 1 ){
                    console.log("al doilea if")
                    return 1;
                }
                else{
                    
                    var a_price = a.getElementsByClassName("price")[0].childNodes[1].textContent.split(" ")[0]
                    var b_price = b.getElementsByClassName("price")[0].childNodes[1].textContent.split(" ")[0]
                    console.log("COMPARARE:a="+a_price)
                    console.log("COMPARARE:b="+b_price)
                    return a_price - b_price
                }
            })
    
            for(var i = 0; i < hotels_array.length; i++){
                let aux = hotels_array[i]
                console.log(aux)
                container.appendChild(aux)
            }
        }
    
        document.getElementById("sort_desc").onclick = function(){
            var container = document.getElementById("gr_hotels")
            //var hotels = container.getElementsByClassName("hotel")
            var hotels = container.children
            //console.log(hotels)
    
            var hotels_array = Array.from(hotels)
            //console.log(hotels_array)
            hotels_array.sort(function(a,b){
                if(a.getElementsByClassName("region")[0].childNodes[1].textContent.localeCompare(b.getElementsByClassName("region")[0].childNodes[1].textContent) == - 1 ){
                    console.log("primul if")
                    return 1;
                }
                if(a.getElementsByClassName("region")[0].childNodes[1].textContent.localeCompare(b.getElementsByClassName("region")[0].childNodes[1].textContent) == 1 ){
                    console.log("al doilea if")
                    return -1;
                }
                else{
                    
                    var a_price = a.getElementsByClassName("price")[0].childNodes[1].textContent.split(" ")[0]
                    var b_price = b.getElementsByClassName("price")[0].childNodes[1].textContent.split(" ")[0]
                    console.log("COMPARARE:a="+a_price)
                    console.log("COMPARARE:b="+b_price)
                    return b_price - a_price
                }
            })
    
            for(var i = 0; i < hotels_array.length; i++){
                let aux = hotels_array[i]
                console.log(aux)
                container.appendChild(aux)
            }
        }
    
        document.getElementById("average").onclick = function(){
            var average = 0
            var count = 0
    
            var container = document.getElementById("gr_hotels")
            var hotels = container.children
            var selected_hotels = []
    
            for(var hotel of hotels){
                if(hotel.style.display != "none"){
                    selected_hotels[count] = hotel
                    count = count + 1
                    var current_price = hotel.getElementsByClassName("price")[0].childNodes[1].textContent.split(" ")[0]
                    average = average + Number(current_price)
                    console.log("SE ADAUGA PRETUL:"+current_price)
                }
            }
    
            if(count > 0){
                average = Number(average/count)
                document.getElementById("average_zone").children[0].innerHTML = "The average starting price calculated from the selected hotels is: "+average + " RON"
            }
            else{
                document.getElementById("average_zone").children[0].innerHTML = "You need to select some hotels in order to find out the average starting price!"
            }
        }


    }

    

    
}