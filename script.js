// Interactividad de la página

// Obtener elementos
const searchBtn = document.querySelector('.search-btn');
const reserveBtns = document.querySelectorAll('.reserve-btn');
const departureInput = document.getElementById('departure');
const arrivalInput = document.getElementById('arrival');

// Evento: Buscar Vuelos
searchBtn.addEventListener('click', function() {
    const departure = departureInput.value;
    const arrival = arrivalInput.value;
    const departureDate = document.getElementById('departure-date').value;
    const passengers = document.getElementById('passengers').value;

    if (!departure || !arrival || !departureDate) {
        alert('Por favor, completa todos los campos requeridos');
        return;
    }

    alert(`Buscando vuelos de ${departure} a ${arrival} para ${passengers} pasajero(s)`);
    console.log({
        departure,
        arrival,
        departureDate,
        passengers
    });
});

// Evento: Reservar Vuelo
reserveBtns.forEach((btn, index) => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.flight-card');
        const airline = card.querySelector('.airline').textContent;
        const time = card.querySelector('.time').textContent;
        const location = card.querySelector('.location').textContent;
        const price = card.querySelector('.amount').textContent;

        showReservationModal(airline, time, location, price);
    });
});

// Modal de Reservación
function showReservationModal(airline, time, location, price) {
    const modalHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <button class="modal-close" onclick="closeModal()">&times;</button>
                <h2>Confirmar Reserva</h2>
                <div class="modal-content">
                    <p><strong>Aerolínea:</strong> ${airline}</p>
                    <p><strong>Hora:</strong> ${time}</p>
                    <p><strong>Destino:</strong> ${location}</p>
                    <p><strong>Precio:</strong> ${price}</p>
                    <div class="passenger-info">
                        <input type="text" placeholder="Nombre Completo" class="modal-input">
                        <input type="email" placeholder="Email" class="modal-input">
                        <input type="text" placeholder="Asiento (Automático)" class="modal-input" disabled value="Asiento: " + Math.floor(Math.random() * 50) + "A">
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

    // Add modal styles if not present
    if (!document.getElementById('modalStyles')) {
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
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function confirmReservation() {
    alert('¡Reserva confirmada! Te enviaremos un correo de confirmación pronto.');
    closeModal();
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    if (event.target.id === 'modalOverlay') {
        closeModal();
    }
});

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
