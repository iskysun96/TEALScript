import { Contract } from '../../src/lib/index';

// Algorand minimum txn fee
const FEE = 1_000;

// Contract address minimum balance
const MIN_BAL = 100_000;

// eslint-disable-next-line no-unused-vars
class EventRSVP extends Contract {
  /** The price of the ticket to rsvp (uALGO) */
  price = new GlobalStateKey<uint64>()

  /** The total number of people who rsvp'd */
  rsvp = new GlobalStateKey<uint64>()

  /** Boolean value indicating if the account checked in or not */
  checked_in = new LocalStateKey<Boolean>()

  // checkOptedIn(): void {
  //   this.app.
  //   assert(this.txn.sender. )

  /**
   * Check if Txn sender is the creator of the contract
   */
  authorizeCreator(): void {
    assert(this.txn.sender === this.app.creator)
  }

  /**
   * Create the RSVP contract
   * 
   * @param eventPrice The price of the ticket to rsvp (uALGO) 
   * 
   */
  create(eventPrice: uint64): void {
    this.rsvp.set(0)
    this.price.set(eventPrice)
  }

  /**
   * Purchase a ticket to the event and opt in to 
   * the contract. Can only call once per account.
   * 
   * @param payment a payment transaction object that is atomically grouped with the opt-in transaction
   * 
   */
  @allow.call("OptIn")
  doRsvp(payment: PayTxn): void {
    assert(globals.groupSize === 2)
    assert(payment.receiver === this.app.address)
    assert(payment.amount === this.price.get())
    assert(!this.checked_in.exists(this.txn.sender))

    this.checked_in.set(this.txn.sender, false)
    this.rsvp.set(this.rsvp.get() + 1)
  }

  /**
   * Check in to the event
   */
  checkIn(): void {
    this.checked_in.set(this.txn.sender, true)
  }

  /**
   * Withdraw funds from the contract using the 
   * internal withdrawFunds subroutine
   */
  withdrawExternal(): void {
    this.withdrawFunds()
  }

  /**
   * Internal Subroutine that withdraw funds from the contract
   */
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

  /**
   * A read only method that gets how many people rsvp'd
   * 
   * @returns the number of people who rsvp'd
   */
  @abi.readonly(true)
  readRsvp(): uint64 {
    this.authorizeCreator()
    return this.rsvp.get()
  }

  /**
   * A read only method that gets the price of the ticket
   * 
   * @returns the price of the ticket
   */
  @abi.readonly(true)
  readPrice(): uint64 {
    return this.price.get()
  }

  /**
   * Refunds the sender the price of the ticket 
   * when the sender closes out of the contract
   */
  @allow.call("CloseOut")
  refund(): void {
    this._doRefund()
  }

  /**
   * Refunds the sender the price of the ticket 
   * when the sender sends a ClearState App call.
   */
  clearState(): void {
    this._doRefund()
  }

  /**
   * Internal method that refunds the sender the price of the ticket
   */
  _doRefund(): void {
    sendPayment({
      amount: this.price.get() - FEE,
      receiver: this.txn.sender,
      fee: FEE,
    })
    this.rsvp.set(this.rsvp.get() - 1)
  }
}