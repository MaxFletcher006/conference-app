import { getAllUsers } from "./api";

async function main() {
  const res = await getAllUsers()
  console.log(res)
}

main()