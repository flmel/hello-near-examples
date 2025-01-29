import { Cards } from '@/components/cards';

import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook'

import { HelloNearContract } from '../../config';

export default function HelloNear() {
  const { signedAccountId, walletSelector } = useWalletSelector();

  const [greeting, setGreeting] = useState('loading...');
  const [newGreeting, setNewGreeting] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!walletSelector) return;
    walletSelector.viewMethod({ contractId: HelloNearContract, method: 'get_greeting' }).then((greeting) => setGreeting(greeting));
  }, [walletSelector]);

  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);

  const saveGreeting = async () => {
    // Try to store greeting, revert if it fails
    walletSelector.callMethod({ contractId: HelloNearContract, method: 'set_greeting', args: { greeting: newGreeting } })
      .then(async () => {
        const greeting = await walletSelector.viewMethod({ contractId: HelloNearContract, method: 'get_greeting' });
        setGreeting(greeting);
      });

    // Assume the transaction will be successful and update the UI optimistically
    setShowSpinner(true);
    await new Promise(resolve => setTimeout(resolve, 300));  // 300ms delay to show spinner
    setGreeting(newGreeting);
    setShowSpinner(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Interacting with the contract: &nbsp;
          <code className={styles.code}>{HelloNearContract}</code>
        </p>
      </div>

      <div className={styles.center}>
        <h1 className="w-100">
          The contract says: <code>{greeting}</code>
        </h1>
        <div className="input-group" hidden={!loggedIn}>
          <input
            type="text"
            className="form-control w-20"
            placeholder="Store a new greeting"
            onChange={(t) => setNewGreeting(t.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-secondary" onClick={saveGreeting}>
              <span hidden={showSpinner}> Save </span>
              <i className="spinner-border spinner-border-sm" hidden={!showSpinner}></i>
            </button>
          </div>
        </div>
        <div className="w-100 text-end align-text-center" hidden={loggedIn}>
          <p className="m-0"> Please login to change the greeting </p>
        </div>
      </div>
      <Cards />
    </main>
  );
}
