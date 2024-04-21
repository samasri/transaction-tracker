export interface Transaction {
  id: string;
  pendingId: string | null;
  isPending: boolean;
  Date: string;
  Name: string;
  Amount: string;
  Account: string;
}
