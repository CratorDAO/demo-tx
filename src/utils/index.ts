declare const window: Window &
  typeof globalThis & {
    keplr: any,
    ethereum: any
  }

export const sendTransaction = async (data: any) => {
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [data],
    });
    return txHash;
  } catch (e) {
    console.log(e);
  }
};
