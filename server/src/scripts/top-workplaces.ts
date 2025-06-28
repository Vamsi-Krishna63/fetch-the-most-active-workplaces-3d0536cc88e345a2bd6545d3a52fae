import axios from "axios";

async function main() {
  // Fetch all shifts from the API
  const { data } = await axios.get("http://localhost:3000/shifts");
  const shifts = data.data;

  // Count completed shifts per workplace
  const workplaceCounts: Record<number, { name: string; shifts: number }> = {};

  for (const shift of shifts) {
    if (shift.workerId && !shift.cancelledAt) {
      if (!workplaceCounts[shift.workplaceId]) {
        // Fetch workplace name from API
        const workplaceRes = await axios.get(`http://localhost:3000/workplaces/${shift.workplaceId}`);
        workplaceCounts[shift.workplaceId] = {
          name: workplaceRes.data.data.name,
          shifts: 0,
        };
      }
      workplaceCounts[shift.workplaceId].shifts++;
    }
  }

  // Convert to array and sort by shift count desc
  const result = Object.values(workplaceCounts)
    .sort((a, b) => b.shifts - a.shifts)
    .slice(0, 3);

  // Output as JSON array (no extra logs)
  console.log(JSON.stringify(result, null, 2));
}

main();
