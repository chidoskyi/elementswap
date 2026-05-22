/**
 * hooks/useApprove.ts
 * Checks allowance and approves with 150% gas boost.
 */

import { useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI } from "../lib/contracts";
import { boostGas }  from "../lib/decimal-utils";
import type { Token } from "../data/tokens";

export function useApprove(
  token:   Token | null,
  spender: `0x${string}` | undefined,
  owner:   `0x${string}` | undefined,
) {
  const { data: allowance, refetch } = useReadContract({
    address:      token?.address as `0x${string}`,
    abi:          ERC20_ABI,
    functionName: "allowance",
    args:         owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender && !!token && !token.isNative,
    },
  });

  const { writeContractAsync } = useWriteContract();

  const approve = async (amount: bigint) => {
    if (!token || !spender || token.isNative) return;
    await writeContractAsync({
      address:      token.address,
      abi:          ERC20_ABI,
      functionName: "approve",
      args:         [spender, amount],
    });
    await refetch();
  };

  const needsApprove = (amount: bigint): boolean => {
    if (!token || token.isNative) return false;
    return (allowance as bigint ?? 0n) < amount;
  };

  return { allowance: allowance as bigint ?? 0n, approve, needsApprove, refetch };
}
