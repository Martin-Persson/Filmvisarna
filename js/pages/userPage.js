import cancelBooking from '../components/cancelBooking.js';
const cancelBookingObject = new cancelBooking();
export default class UserPage {
  constructor() {
    this.today = this.getTodayDate();
    this.cancelBookingListener();
  }

  getTodayDate() {
    // let today = new Date().toLocaleDateString();
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    return today;
  }

  async cancelBookingListener() {
    if (!this.userBookings) {
      await this.read();
      this.userBookings.forEach((element) => {
        $('main').on(
          'click',
          '.' + element.bookingNumber,
          (cancelBookingButton) => {
            console.log(cancelBookingButton.target.className);
            cancelBookingObject.cancelBookingById("temp",cancelBookingButton.target.className);
          }
        );
      });
    }
  }

  async read() {
    if (window.username == 'admin@admin.se') {
      this.userBookings = await $.getJSON(
        `/json/bookings/adminbookings/bookings.json`
      );
    } else {
      this.userBookings = await $.getJSON(
        `/json/bookings/users/${window.username}.json`
      );
    }
  }

  async render() {
    if (!this.userBookings) {
      await this.read();
    }
    let html = $(/*html*/ `
        <div class="userpage-container">
        <div class="userpage-title">
          <h1>Mina Sidor</h1>
          <p>${window.username}</p>
        </div>
        </div>
    `);

    let num = 1;
    console.log(this.userBookings);
    this.userBookings.forEach((booking) => {
      console.log(booking.bookingNumber);
      let btn = '';
      if (booking.bookingNumber) {
        btn = `<div class="booking-button"><p>Avboka</p><button class="${booking.bookingNumber}">X</button></div>`;
      } else {
        btn = '';
      }
      html.append(/*html*/ `
        <div class="userpage-bookings">
          <article class="userpage-booking">
              <div class="booking-top">
                <h2>Bokning ${num++}</h2>
                ${booking.date > this.today ? btn : ''}  
              </div>
              <div class="booking-bottom">
                <h3>${booking.film}</h3>
                <p>Bokningsnummer: <b>${booking.bookingNumber}</b> 
                  | Platser:<b> ${booking.seat}</b>
                  | Pris: <b>${booking.price} kr</b></p>
                <div class="movieDate-container">Datum: <div class="movie-date">${
                  booking.date
                }</div></div>
              </div>
          </article>
        </div>
      </div>`);
    });
    return html;
  }
}
