import { Contract } from '../../src/lib/index';

// Algorand minimum txn fee
const FEE = 1_000;

// Contract address minimum balance
const MIN_BAL = 100_000;

// eslint-disable-next-line no-unused-vars
class EventRSVP extends Contract {
  price = new GlobalStateKey<uint64>()

  rsvp = new GlobalStateKey<uint64>()

  checked_in = new LocalStateKey<uint64>()

  // checkOptedIn(): void {
  //   this.app.
  //   assert(this.txn.sender. )

  authorizeCreator(): void {
    assert(this.txn.sender === this.app.creator)
  }

  @handle.createApplication
  create(eventPrice: uint64): void {
    this.rsvp.set(0)
    this.price.set(eventPrice)
  }

  @handle.optIn
  doRsvp(payment: PayTxn): void {
    assert(globals.groupSize === 2)
    assert(payment.receiver === this.app.address)
    assert(payment.amount === this.price.get())

    this.checked_in.set(this.txn.sender, 0)
    this.rsvp.set(this.rsvp.get() + 1)
  }

  checkIn(): void {
    this.checked_in.set(this.txn.sender, 1)
  }

  withdrawExternal(): void {
    this.withdrawFunds()
  }


  private withdrawFunds(): void {
    const rsvpBal = this.app.address.balance
    assert(rsvpBal > MIN_BAL + FEE)
    sendPayment({
      amount: rsvpBal - (MIN_BAL + FEE),
      receiver: this.txn.sender,
      fee: FEE,
    })
  }

  /**
   * Read Methods
   */

  readRsvp(): uint64 {
    this.authorizeCreator()
    return this.rsvp.get()
  }

  @abi.readonly
  readPrice(): uint64 {
    return this.price.get()
  }

  @handle.closeOut
  refund(): void {
    this._doRefund()
  }


  @handle.clearState
  clearState(): void {
    this._doRefund()
  }

  _doRefund(): void {
    sendPayment({
      amount: this.price.get() - FEE,
      receiver: this.txn.sender,
      fee: FEE,
    })
    this.rsvp.set(this.rsvp.get() - 1)
  }
}