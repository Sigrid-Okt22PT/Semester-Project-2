/**
 * Returns the highest bid amount from a listing
 * @param {{ bids?: Array<{ amount?: number }> }} listing
 * @returns {number}
 */
export function getHighestBid(listing) {
  let highest = 0;

  if (!listing || !Array.isArray(listing.bids)) {
    return highest;
  }

  for (let i = 0; i < listing.bids.length; i++) {
    const amount = Number(listing.bids[i]?.amount || 0);
    if (amount > highest) highest = amount;
  }

  return highest;
}
