// Interactividad de la página

const API_URL = 'https://api.instantwebtools.net/v1/airlines';
const RESERVATIONS_API_URL = '/api/reservations';
const searchBtn = document.querySelector('.search-btn');
const departureInput = document.getElementById('departure');
const arrivalInput = document.getElementById('arrival');
const departureDateInput = document.getElementById('departure-date');
const passengersInput = document.getElementById('passengers');
const flightsGrid = document.getElementById('flightsGrid');
const loader = document.getElementById('loader');
const message = document.getElementById('message');
let currentReservation = null;

searchBtn.addEventListener('click', searchFlights);
flightsGrid.addEventListener('click', handleFlightGridClick);

document.addEventListener('DOMContentLoaded', () => {
    showMessage('Busca vuelos para ver resultados');
});

async function searchFlights() {
    const departure = departureInput.value.trim();
    const arrival = arrivalInput.value.trim();
    const departureDate = departureDateInput.value;
    const passengers = Number(passengersInput.value) || 1;

    if (!departure || !arrival || !departureDate) {
        showMessage('Por favor, completa todos los campos requeridos', true);
        return;
    }

    showLoader(true);
    showMessage('Buscando vuelos...', false);

    try {
        const flights = await fetchFlights(departure, arrival, departureDate, passengers);

        if (flights.length === 0) {
            renderFlights([]);
            showMessage('No se encontró ningún vuelo. Intenta otra búsqueda.', true);
            return;
        }

        renderFlights(flights);
        showMessage(
            `Resultados para ${departure} → ${arrival} el ${formatDate(departureDate)} (${passengers} pasajero${passengers > 1 ? 's' : ''})`
        );
    } catch (error) {
        console.error(error);
        renderFlights([]);
        showMessage('Error al cargar los vuelos. Intenta de nuevo más tarde.', true);
    } finally {
        showLoader(false);
    }
}

async function fetchFlights(departure, arrival, departureDate, passengers) {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`API respondio con estado ${response.status}`);
    }

    const airlines = await response.json();
    const sampleFlights = airlines.slice(0, 8).map((airline, index) => {
        const durationMinutes = getRandomDuration();
        const departureTime = getRandomTime(6, 22);
        return {
            id: airline.id || index,
            airline: airline.name || 'Aerolínea',
            rating: getRandomRating(),
            departure,
            arrival,
            departureDate,
            departureTime,
            arrivalTime: getArrivalTime(departureTime, durationMinutes),
            duration: formatDuration(durationMinutes),
            price: getRandomPrice(),
            seats: passengers,
            info: airline.slogan || airline.country || 'Servicio confiable'
        };
    });

    return sampleFlights;
}

function renderFlights(flights) {
    flightsGrid.innerHTML = '';

    if (flights.length === 0) {
        return;
    }

    const fragment = document.createDocumentFragment();

    flights.forEach((flight) => {
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.dataset.departure = flight.departure;
        card.dataset.arrival = flight.arrival;
        card.dataset.departureDate = flight.departureDate;
        card.dataset.seats = String(flight.seats);

        card.innerHTML = `
            <div class="flight-header">
                <span class="airline">✈️ ${flight.airline}</span>
                <span class="rating">${flight.rating}</span>
            </div>
            <div class="flight-details">
                <div class="flight-route">
                    <div class="airport">
                        <div class="time">${flight.departureTime}</div>
                        <div class="location">${flight.departure} (Salida)</div>
                    </div>
                    <div class="flight-arrow">
                        <div class="duration">${flight.duration}</div>
                        <div class="line"></div>
                    </div>
                    <div class="airport">
                        <div class="time">${flight.arrivalTime}</div>
                        <div class="location">${flight.arrival} (Llegada)</div>
                    </div>
                </div>
                <p class="flight-info">${flight.info}</p>
            </div>
            <div class="flight-footer">
                <div class="price">
                    <span class="amount">€${flight.price}</span>
                    <span class="person">por persona</span>
                </div>
                <button class="reserve-btn">Reservar</button>
            </div>
        `;

        fragment.appendChild(card);
    });

    flightsGrid.appendChild(fragment);
}

function handleFlightGridClick(event) {
    const target = event.target;
    if (!target.classList.contains('reserve-btn')) {
        return;
    }

    const card = target.closest('.flight-card');
    if (!card) {
        return;
    }

    const airline = card.querySelector('.airline').textContent;
    const departureTime = card.querySelector('.airport .time')?.textContent || '';
    const arrivalTime = card.querySelectorAll('.airport .time')[1]?.textContent || '';
    const departure = card.dataset.departure;
    const arrival = card.dataset.arrival;
    const date = card.dataset.departureDate;
    const price = card.querySelector('.amount').textContent;
    const seats = card.dataset.seats;
    const duration = card.querySelector('.duration')?.textContent || '';

    showReservationModal({
        airline,
        departure,
        arrival,
        date,
        departureTime,
        arrivalTime,
        price,
        seats,
        duration
    });
}

function showReservationModal({ airline, departure, arrival, date, departureTime, arrivalTime, price, seats, duration }) {
    const seatNumber = `Asiento: ${Math.floor(Math.random() * 50) + 1}A`;
    currentReservation = {
        airline,
        departure,
        arrival,
        departureDate: date,
        departureTime,
        arrivalTime,
        duration,
        price,
        seats,
        seat: seatNumber
    };

    const modalHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <button class="modal-close" onclick="closeModal()">&times;</button>
                <h2>Confirmar Reserva</h2>
                <div class="modal-content">
                    <p><strong>Aerolínea:</strong> ${airline}</p>
                    <p><strong>Origen:</strong> ${departure}</p>
                    <p><strong>Destino:</strong> ${arrival}</p>
                    <p><strong>Fecha:</strong> ${formatDate(date)}</p>
                    <p><strong>Salida:</strong> ${departureTime}</p>
                    <p><strong>Llegada:</strong> ${arrivalTime}</p>
                    <p><strong>Pasajeros:</strong> ${seats}</p>
                    <p><strong>Precio:</strong> ${price}</p>
                    <div class="passenger-info">
                        <input id="reservationName" type="text" placeholder="Nombre Completo" class="modal-input">
                        <input id="reservationEmail" type="email" placeholder="Email" class="modal-input">
                        <input id="reservationSeat" type="text" class="modal-input" disabled value="${seatNumber}">
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="closeModal()" class="modal-btn-cancel">Cancelar</button>
                    <button onclick="confirmReservation()" class="modal-btn-confirm">Confirmar Reserva</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
}

function addModalStyles() {
    if (document.getElementById('modalStyles')) {
        return;
    }

    const styleSheet = document.createElement('style');
    styleSheet.id = 'modalStyles';
    styleSheet.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        .modal {
            background: white;
            border-radius: 15px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #999;
            transition: color 0.3s ease;
        }

        .modal-close:hover {
            color: #333;
        }

        .modal h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
        }

        .modal-content {
            margin-bottom: 30px;
        }

        .modal-content p {
            margin: 12px 0;
            color: #555;
            font-size: 14px;
        }

        .modal-content strong {
            color: #333;
        }

        .passenger-info {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .modal-input {
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .modal-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-input:disabled {
            background: #f0f0f0;
            color: #999;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .modal-btn-cancel,
        .modal-btn-confirm {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .modal-btn-cancel {
            background: #e0e0e0;
            color: #333;
        }

        .modal-btn-cancel:hover {
            background: #d0d0d0;
        }

        .modal-btn-confirm {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .modal-btn-confirm:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .modal-btn-confirm:active {
            transform: scale(0.98);
        }
    `;
    document.head.appendChild(styleSheet);
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
    currentReservation = null;
}

async function confirmReservation() {
    if (!currentReservation) {
        alert('No hay reserva seleccionada.');
        return;
    }

    const nameInput = document.getElementById('reservationName');
    const emailInput = document.getElementById('reservationEmail');
    const name = nameInput?.value.trim();
    const email = emailInput?.value.trim();

    if (!name || !email) {
        alert('Por favor, ingresa nombre y email para confirmar la reserva.');
        return;
    }

    const reservationPayload = {
        ...currentReservation,
        name,
        email
    };

    try {
        const response = await fetch(RESERVATIONS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservationPayload)
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || 'Error al guardar la reserva');
        }

        const result = await response.json();
        alert(`Reserva guardada correctamente (ID ${result.id}).`);
        showMessage('Reserva guardada con éxito.', false);
        closeModal();
    } catch (error) {
        console.error(error);
        alert('No se pudo guardar la reserva. Intenta nuevamente.');
    }
}

document.addEventListener('click', function (event) {
    if (event.target.id === 'modalOverlay') {
        closeModal();
    }
});

function showLoader(show) {
    loader.classList.toggle('hidden', !show);
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle('error', isError);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function getRandomTime(minHour, maxHour) {
    const hour = Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;
    const minutes = Math.floor(Math.random() * 6) * 10;
    return `${pad(hour)}:${pad(minutes)}`;
}

function getRandomDuration() {
    return Math.floor(Math.random() * 91) + 120; // entre 120 y 210 minutos
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

function getArrivalTime(departureTime, durationMinutes) {
    const [hour, minute] = departureTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute + durationMinutes);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getRandomPrice() {
    return Math.floor(Math.random() * 120) + 80;
}

function getRandomRating() {
    const rating = (Math.random() * 1 + 4).toFixed(1);
    return `${rating} ★`;
}

function pad(value) {
    return value.toString().padStart(2, '0');
}

// Agregar animación fadeOut si no existe
if (!document.getElementById('fadeOutStyle')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'fadeOutStyle';
    styleSheet.textContent = `
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}
