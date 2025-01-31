## Create, Update, and Delete

By default, Algorand applications can be created, updated, and deleted. In TEALScript, applications can be created by default, but cannot be updated to deleted. The default {@link Contract.createApplication} method won't run any logic, but rather simply create the application on the chain. 

### Modifying create logic

To modify the logic executed upon applicaiton creation (for example, to set default storage values) your contract class must implement a method to override {@link Contract.createApplication}.

#### Example
```typescript
class Counter extends Contract {
  counter = new GlobalStateKey<number>();

  createApplication(startingNumber: number) {
    this.counter.set(startingNumber)
  }
}
```

### Implementing a updateApplication Method

By defualt, TEALScript contracts cannot be updated. To allow a contract to be updated, a method that overrides {@link Contract.updateApplication} must be implemented.

#### Example
```typescript
class Counter extends Contract {
  counter = new GlobalStateKey<number>();

  createApplication(startingNumber: number) {
    this.counter.set(startingNumber)
  }

  updateApplication() {
    assert(this.txn.sender === this.app.creator)
  }
}
```

### Implementing a deleteApplication Method

By defualt, TEALScript contracts cannot be deleted. To allow a contract to be deleted, a method that overrides {@link Contract.deleteApplication} must be implemented.

#### Example
```typescript
class Counter extends Contract {
  counter = new GlobalStateKey<number>();

  createApplication(startingNumber: number) {
    this.counter.set(startingNumber)
  }

  deleteApplication() {
    assert(this.txn.sender === this.app.creator)
  }
}
```

## OptIn, CloseOut, and ClearState

If your contract uses local state, you will need to override the {@link Contract.optInToApplication} method and override {@link Contract.closeOutOfApplication} and/or {@link Contract.clearState} as desired. To learn more about contract state, see {@page storage.md}

## Advanced OnComplete Control

To have more granular control on what OnComplete a specific method allows, use the {@link allow.call} or {@link allow.create} decorator to control allowed OnCompletes when calling or creating the application. 

### Example

```typescript
class Counter extends Contract {
  counter = new LocalStateKey<number>();

  // This method will increment a counter in local state
  @allow.create('OptIn') // Allow an OptIn create so the creators counter can be set when creating the app
  @allow.call('OptIn')   // Allow anyone to OptIn to the contract so they can use local state
  @allow.call('NoOp')    // Allow anyone to call the app again with a NoOp call (can only OptIn once)
  useLocalState() {
    if (!this.counter.exists(this.txn.sender)) this.counter.set(this.txn.sender, 1)
    else this.counter.set(this.txn.sender, this.counter.get(this.txn.sender) + 1)
  }
}
```