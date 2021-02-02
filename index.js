var express = require('express');
var app = express(); //aici am creat serverul
app.set('view engine','ejs');

var path = require('path');
var mysql = require('mysql');
const formidable = require('formidable');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
//const e = require('express');
const session = require('express-session')
var fs = require('fs')

const http = require('http')
const socket = require('socket.io')
const server = new http.createServer(app) //cream serverul simplu
var io = socket(server) //creeam socketul pe server
io = io.listen(server)

io.on("connection",(socket)=>{
	console.log("Connected!")

	socket.on("disconnect",()=>{
		console.log("Disconnected!")
	})
})

var conexiune = mysql.createConnection({
	host: "localhost",
	user: "claudia",
	password: "Parola_Claudia123",
	database: "proiect_tw"
});
conexiune.connect(function (err) {

	if (err) throw err;
    console.log("Ne-am conectat!!! Yayyyy!!");
});

console.log(__dirname)
app.use(express.static(path.join(__dirname,"Resources")));
app.use(express.static(path.join(__dirname,"uploaded_photos")));
app.use('/node_modules', express.static(path.join(__dirname,"node_modules")));


app.use(session({
	secret:'abdefg',
	resave:true,
	saveUninitialized:false
}));

// aici astept cereri de forma localhost:8080 (fara nimic dupa)
app.get('/', function(req, res){
	if(req.session){
		res.render('pages/index', {utilizator:req.session.user});//afisez index-ul in acest caz
	}
	else{
		res.render('pages/index');
	}
});

async function trimiteMail(nume, prenume, username, email){
	var transp = nodemailer.createTransport({
		service:"gmail",
		secure: false,
		port: 8000,
		auth:{
			user:"c.xandra21@gmail.com",
			pass:"parolaTW123"
		},
		tls:{
			//sa nu respinga cererile neautorizate prin oauth
			rejectUnauthorized: false
		}
	});
	// a fct asincrona adica se asteapta pana cand are procesorul timp si o va executa atunci
	await transp.sendMail({
		from:"c.xandra21@gmail.com",
		to:email,
		subject: "Salut, stimate " + nume + " " + prenume,
		text:"Username-ul tau este " + username + " pe site-ul BeautifulRomania!",
		html:"<h1>Salut!</h1><br><p>Username-ul tau este " + username + " pe site-ul <span style='text-decoration:underline;font-weight:bold; font-style:italic;'>BeautifulRomania</span>!</p>"
	})
	console.log("s-a trimis mail")
}

var parolaServer = "tehniciWeb"
app.post("/signup", function(req, res){
	var formular = formidable.IncomingForm()
	var username
	var calePoza

	//parse e functie asincrona (se executa cand avem toate datele)
	formular.parse(req, function(eroare, campuriText, campuriFisier){
		console.log(campuriText);
		var eroare = "";
		if(campuriText.username == ""){
			eroare += "Blank Username!<br>"
		}
		if(campuriText.nume == ""){
			eroare += "Blank last name!<br>"
		}
		
		if(campuriText.prenume == ""){
			eroare += "Blank first name!<br>"
		}

		if(campuriText.email == ""){
			eroare += "Blank email!<br>"
		}
		
		if(campuriText.parola == ""){
			eroare += "Blank password!<br>"
		}
		//verificare daca exista utilizatorul in baza deja

		if(eroare == ""){
			unescapedUsername = campuriText.username
			unescapedEmail = campuriText.email
			unescapedNume = campuriText.nume
			unescapedPrenume = campuriText.prenume

			campuriText.username = mysql.escape(campuriText.username)
			campuriText.nume = mysql.escape(campuriText.nume)
			campuriText.prenume = mysql.escape(campuriText.prenume)
			campuriText.email = mysql.escape(campuriText.email)
			var parolaCriptata = crypto.scryptSync(campuriText.parola, parolaServer,32).toString('ascii');
			parolaCriptata = mysql.escape(parolaCriptata)
			campuriText.poza = mysql.escape(campuriText.poza)
			calePoza = mysql.escape(calePoza)

			var preluare = `select id_utilizator from utilizator where username = ${campuriText.username}`

			conexiune.query(preluare, function(err,rez, campuri){
				if(err) {
					console.log(err);
					throw err;
				}
				if(rez.length != 0){
					eroare += "This username already exists!<br>"
					console.log("EROARE-----",eroare);
					res.render("pages/create_user",{err:eroare, raspuns:"Please retype the data!"})
				}
				else{
					//daca nu avem erori, procesam campurile
					var comanda =`insert into utilizator (username, nume, prenume, parola, email, telefon, imag_profil) values(${campuriText.username},${campuriText.nume},${campuriText.prenume}, ${parolaCriptata}, ${campuriText.email},${campuriText.telefon}, ${calePoza})`;
					//32 inseamna cat de lunga e parola criptata
					console.log("CALE POZA: ", campuriText.poza)
					conexiune.query(comanda, function(err,rez, campuri){
						if(err) {
							console.log(err);
							throw err;
						}
						trimiteMail(unescapedNume, unescapedPrenume, unescapedUsername, unescapedEmail);
						console.log("ceva");
						res.render("pages/create_user",{err:"", raspuns: "User created sucessfully!"})
					})		
				}
			})
		}
		else{
			console.log("EROARE2-----",eroare);
			res.render("pages/create_user",{err:eroare, raspuns:"Please retype the data!"})
		}

	})

	//pe masura ce primeste date:
	formular.on("field", function(name, field){
		if(name == 'username'){
			if( !(field.includes('\\') || field.includes('/')) ){
				username = field
			}
			else{
				username = "defaultFolder"
			}
		}
	})

	//aici incepe preluarea imaginii (upload)
	//se transmite cate un pachetel, cate un pachetel din poza intreaga
	formular.on("fileBegin", function(name, campFisier){
		console.log("Inceput upload: ",name)

		//ne asiguram ca primim un fisier
		if(campFisier && campFisier.name != ""){
			//avem fisier transmis
			var cale = __dirname + "/uploaded_photos/" + username
			if(!fs.existsSync(cale)){
				fs.mkdirSync(cale)
			}
			campFisier.path = cale + "/" + campFisier.name;
			calePoza = "/"+username+"/"+campFisier.name
		}	
	})

	// se termina uploadul
	formular.on("file", function(name, field){
		console.log("final upload: ",name)	
	})
});

app.post("/login", function(req, res){
	var formular = formidable.IncomingForm()
	console.log("a intrat pe login")

	formular.parse(req, function(eroare, campuriText, campuriFisier){
		console.log(campuriText);
		var eroare = "";
		var parolaCriptata = crypto.scryptSync(campuriText.parola, parolaServer,32).toString('ascii')
		parolaCriptata = mysql.escape(parolaCriptata)
		campuriText.username = mysql.escape(campuriText.username)


		var comanda = `select username, email, rol, imag_profil from utilizator where username =${campuriText.username} and parola = ${parolaCriptata}`;
		console.log(comanda)

		conexiune.query(comanda, function(err, rez, campuri){
			if(err){
				console.log(err);
				throw err;
			}
			if(rez.length == 1){
				console.log(rez)

				user = {
					username: rez[0].username,
					email:rez[0].email,
					rol: rez[0].rol,
					poza: rez[0].imag_profil
				}
				//creez un camp numit user in sesiune ca sa avem aces la el in orice pagina
				//session e o variabila vizibila de toate requesturile
				req.session.user = user;
				res.render("pages/index",{utilizator:user});
			}
			else{
				res.render("pages/create_user")
			}
		})
	})
})

async function trimiteMailPromo(username, email){
	var transp = nodemailer.createTransport({
		service:"gmail",
		secure: false,
		port: 8000,
		auth:{
			user:"c.xandra21@gmail.com",
			pass:"parolaTW123"
		},
		tls:{
			//sa nu respinga cererile neautorizate prin oauth
			rejectUnauthorized: false
		}
	});
	// a fct asincrona adica se asteapta pana cand are procesorul timp si o va executa atunci
	await transp.sendMail({
		from:"c.xandra21@gmail.com",
		to:email,
		subject: "Promovare " + username,
		text:"Ai fost promovat in rolul de admin!",
		html:"<h1>Salut," + username + "!</h1><br><p>Ai fost promovat la rolul de admin!</p>"
	})
	console.log("s-a trimis mail cu romovare")
}

async function trimiteMailRetro(username, email){
	var transp = nodemailer.createTransport({
		service:"gmail",
		secure: false,
		port: 8000,
		auth:{
			user:"c.xandra21@gmail.com",
			pass:"parolaTW123"
		},
		tls:{
			//sa nu respinga cererile neautorizate prin oauth
			rejectUnauthorized: false
		}
	});
	// a fct asincrona adica se asteapta pana cand are procesorul timp si o va executa atunci
	await transp.sendMail({
		from:"c.xandra21@gmail.com",
		to:email,
		subject: "Promovare " + username,
		text:"Ai fost retrogradat din rolul de admin in rolul comun!",
		html:"<h1>Salut," + username + "!</h1><br><p>Ai fost retrogradat din rolul de admin in rolul comun!</p>"
	})
	console.log("s-a trimis mail cu retrogradare")
}

app.post("/promoveaza", function(req, res){
	var formular = formidable.IncomingForm()
	formular.parse(req, function(eroare, campuriText, campuriFisier){
		var comanda = `update utilizator set rol='admin' where id_utilizator = ${campuriText.id}`;
		var comanda2 = `select email, username from utilizator where id_utilizator = ${campuriText.id}`;
		
		console.log(comanda)
		console.log(comanda2)

		//pentru trimis mail:
		var username
		var email

		//ca sa nu delogam adminul
		var utiliz = null;
		if(req.session){
			utiliz = req.session.user
		}
		else{
			utiliz = null;
		}

		conexiune.query(comanda, function(err,rez, campuri){
			if(err){
				console.log(err);
				throw err;
			}
			//alert("S-a promovat cu succes!")
			conexiune.query(comanda2,function(err, rez, campuri){
				if(err){
					console.log(err);
					throw err;
				}
				username = rez[0].username
				email = rez[0].email

				trimiteMailPromo(username, email)
			})
			
			res.redirect('/users')
		})
	})
});

app.post("/retrogradeaza", function(req, res){
	var formular = formidable.IncomingForm()
	formular.parse(req, function(eroare, campuriText, campuriFisier){
		var comanda = `update utilizator set rol='comun' where id_utilizator = ${campuriText.id}`;
		var comanda2 = `select email, username from utilizator where id_utilizator = ${campuriText.id}`;
		
		console.log(comanda)
		console.log(comanda2)

		//pentru trimis mail:
		var username
		var email

		//ca sa nu delogam adminul
		var utiliz = null;
		if(req.session){
			utiliz = req.session.user
		}
		else{
			utiliz = null;
		}

		conexiune.query(comanda, function(err,rez, campuri){
			if(err){
				console.log(err);
				throw err;
			}
			//alert("S-a promovat cu succes!")
			conexiune.query(comanda2,function(err, rez, campuri){
				if(err){
					console.log(err);
					throw err;
				}
				username = rez[0].username
				email = rez[0].email

				trimiteMailRetro(username, email)
			})
			
			res.redirect('/users')
		})
	})
});


app.post("/schimba_rol", function(req, res){
	var formular = formidable.IncomingForm()
	formular.parse(req, function(eroare, campuriText, campuriFisier){

		var roleBefore = campuriText.role

		var comanda
		if(roleBefore == 'admin'){
			var comanda = `update utilizator set rol='comun' where id_utilizator = ${campuriText.id}`;
		}
		else{
		 	comanda = `update utilizator set rol='admin' where id_utilizator = ${campuriText.id}`;
		}


		var comanda2 = `select email, username from utilizator where id_utilizator = ${campuriText.id}`;
		
		console.log(comanda)
		console.log(comanda2)

		//pentru trimis mail:
		var username
		var email

		//ca sa nu delogam adminul
		var utiliz = null;
		if(req.session){
			utiliz = req.session.user
		}
		else{
			utiliz = null;
		}

		conexiune.query(comanda, function(err,rez, campuri){
			if(err){
				console.log(err);
				throw err;
			}
			//alert("S-a promovat cu succes!")
			conexiune.query(comanda2,function(err, rez, campuri){
				if(err){
					console.log(err);
					throw err;
				}
				username = rez[0].username
				email = rez[0].email

				if(roleBefore == 'admin'){
					trimiteMailRetro(username, email)
				}
				else{
					trimiteMailPromo(username,email)
				}
			})
			

			res.redirect('/users')
		})
	})
});

app.get('/logout', function(req, res){
	req.session.destroy();
	res.render('pages/index');
});


app.post('/mesaj', function(req, res) {

	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		console.log("primit mesaj")
		//if(conexiune_index){

			var d=new Date();
			var numberDate = d.getDate() 
			var month = d.getMonth()+1
			var year = d.getFullYear()
			var data = year + "/" +month + "/" + numberDate
			var hour = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
			var ora = data + " " + hour 
			//trimit catre restul de utilizatori mesajul primit
			console.log(fields.poza_profil)
			io.sockets.emit('mesaj_nou', fields.nume, fields.culoare, fields.culoare_fundal, fields.mesaj, fields.poza_profil, ora);
		//}
    res.send("ok");
    });
	
	
});

app.get('/users', function(req, res){

	var utiliz = null;
	if(req.session){
		utiliz = req.session.user
		console.log("-----------------------E LOGAT LA USERI")
	}
	else{
		utiliz = null;
	}

	conexiune.query("select id_utilizator, username, nume, prenume, rol from utilizator", function(err, result, campuri){
		if(err) throw err;
		console.log(result);
		res.render('pages/users',{useri:result, utilizator:utiliz});
	});
});

app.get('/hotels', function(req, res){

	var utiliz = null;
	if(req.session){
		utiliz = req.session.user
		console.log("-----------------------E LOGAT LA HOTELE")
	}
	else{
		utiliz = null;
	}

	conexiune.query("select * from hotel", function(err, result, campuri){
		if(err) throw err;
		console.log(result);
		res.render('pages/hotels',{hotels:result, utilizator:utiliz});
	});
});

app.get('/dynamic_gallery', function(req, res){
	var utiliz = null;
	if(req.session){
		utiliz = req.session.user
	}
	else{
		utiliz = null;
	}

	res.render('pages/dynamic_gallery', {utilizator:utiliz});//afisez index-ul in acest caz
});

app.get('/static_gallery', function(req, res){
	var utiliz = null;
	if(req.session){
		utiliz = req.session.user
	}
	else{
		utiliz = null;
	}

	res.render('pages/static_gallery', {utilizator:utiliz});//afisez index-ul in acest caz
});

//aici astept orice tip de cerere (caracterul special * care tine loc de orice sir)
app.get('/*', function(req, res){
	
	var utiliz = null;
	if(req.session){
		utiliz = req.session.user
	}
	else{
		utiliz = null;
	}

	res.render('pages/'+req.url,{utilizator:utiliz, port:s_port}, function(err, rezRandare){
		if(err){//intra doar cand avem eroare
			if(err.message.includes("Failed to lookup view"))
				res.status(404).render('pages/404');
			else
				throw err;
		}
		else{
			res.send(rezRandare);
		}
	});//afisez pagina ceruta dupa localhost:8080
	//de exemplu pentru localhost:8080/pag2 va afisa fisierul /pag2 din folderul pagini
	console.log(req.url);//afisez in consola url-ul pentru verificare
});

s_port=process.env.PORT || 8080
server.listen(s_port)

//app.listen(8080);//serverul asculta pe portul 8080
console.log("A pornit serverul pe portul 8080");//afisez in consola un mesaj sa stiu ca nu s-a blocat