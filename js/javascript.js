var listarHoteles = [];
var marker = null;

function cambiarPagina(page){
	$.mobile.changePage("#"+page, {
		transition: "turn"
	});
}

function reconstruirTabla(){
	var ulHotels = $("#ulHoteles");
	$(".lihotel").remove();

	if (listarHoteles.length == 0) {
		var li = $("<li>").addClass("lihotel");
		li.text("No hay hoteles registrados.");
		ulHotels.append(li);
	}
	
	$(listarHoteles).each(function(i,e){
		var li = $("<li>").addClass("lihotel");
		var a = $("<a>").text(e.nombre).data("hotel", e).click(function(){
			verHotel($(this).data("hotel"));
		});
		li.append(a);
		ulHotels.append(li);
	});
	
	if (ulHotels.hasClass('ui-listview')) {
    	ulHotels.listview('refresh');
    } else {
    	ulHotels.trigger('create');
    }	
}

function limpiarCamposRegistro() {
		$("#txtNombre").val("");
		$("#txtCiudad").val("");
		$("#txtTelefono").val("");
		$("#txtEstrellas").val("");
}

function agregarMarcador(e) {
	if (marker) {
		marker.setMap(null);
		marker = null;
	}	
	
	marker = new google.maps.Marker({
		position: e.latLng,
		map: this,
		draggable: true,
		title: $("#txtNombre").val() == "" ? "Ubicación Hotel" : $("#txtNombre").val()
	});

	var txtCiudad = $('#txtCiudad');
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'location': e.latLng}, function(results, status){
			if (status == google.maps.GeocoderStatus.OK && results[2]){
				txtCiudad.val(results[2].formatted_address);
			} else {
				txtCiudad.val("");
			}
		});
}

$(document).ready(function () {
	if (typeof(Storage) !== "undefined") {
		var lstHoteles = localStorage.lstHoteles;
		if (lstHoteles && lstHoteles.length > 0) {
			listarHoteles = $.parseJSON(lstHoteles);
		}
	}

	reconstruirTabla();

	$("#paginaRegistro").on("pageshow", function (event, ui) {
		var LatLng = new google.maps.LatLng(-32.2318338,-63.976344); 
		var opciones = {            
				zoom: 5,
				center: LatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP        
		};
		var mapa = new google.maps.Map(document.getElementById("divMap"), opciones);
		mapa.addListener('click', agregarMarcador);
		$("#txtNombre").focus();
	});
	
	$("#paginaListaHoteles").on("pageshow", function (event, ui) {		
		var hotel = $("#divMap2").data("hotel");
		var LatLng = new google.maps.LatLng(hotel.ubicacion.lat,hotel.ubicacion.long); 
		var opciones = {            
				zoom: 5,
				center: LatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP        
		};
		var mapa = new google.maps.Map(document.getElementById("divMap2"), opciones);
			
		var myMarker = new google.maps.Marker({
			position: LatLng,
			map: mapa,
			title: hotel.nombre
		});
		
	});

	$("#btnRegistrar").click(function () {
		limpiarCamposRegistro();	
		
		cambiarPagina("paginaRegistro");
	});
	
	$("#btnListar, #btnListar1").click(function (){
		 cambiarPagina("paginaLista");
	});

	$("#btnVolver, #btnVolver1").click(function (){
		 cambiarPagina("paginaInicio");
	});

	$("#btnRegistrarHotel").click(crearHotel);
});

function verHotel(hotel) {
	$("#lblNombre").text(hotel.nombre);
	$("#lblCiudad").text(hotel.ciudad);
	$("#lblTelefono").text(hotel.telefono);
	$("#lblEstrellas").text(hotel.estrellas);
	$("#divMap2").data("hotel", hotel);

	cambiarPagina("paginaListaHoteles");
}

function crearHotel() {
	var nombre = $("#txtNombre").val();
	var ubicacion = {lat: null, "long": null};
	if (marker) {
		var ubicacion = {lat: marker.getPosition().lat(), "long": marker.getPosition().lng()};			
	}
	var ciudad = $("#txtCiudad").val();
	var telefono = $("#txtTelefono").val();
	var estrellas = $("#txtEstrellas").val();

	if (nombre == "") {
		alert("Por favor suministre un nombre para este hotel.");
		return false;
	}

	if (ciudad == "") {
		alert("Por favor suministre la ciudad donde está localizado el hotel.");
		return false;
	}

	var hotel = {
		nombre: nombre,
		ubicacion: ubicacion,
		ciudad: ciudad,
		telefono: telefono,
		estrellas: estrellas,
		id: null
	};

	if (listarHoteles === undefined) listarHoteles = [];
	hotel.id = listarHoteles.length + 1;
	listarHoteles.push(hotel);
	saveToLocalStorage();
	
	limpiarCamposRegistro();
    reconstruirTabla();
    verHotel(hotel);
}

function saveToLocalStorage(){
	if (typeof(Storage) !== "undefined") {
		//Guardo lista de hoteles
		localStorage.lstHoteles = JSON.stringify(listarHoteles);
    }
}
