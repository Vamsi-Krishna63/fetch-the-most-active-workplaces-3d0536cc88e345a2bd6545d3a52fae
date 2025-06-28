const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function findTopWorkplaces() {
  try {
    console.log("Finding the most active workplaces...\n");

    // Get workplaces with their shift counts, ordered by most active
    const topWorkplaces = await prisma.workplace.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: {
            shifts: true,
          },
        },
      },
      orderBy: {
        shifts: {
          _count: "desc",
        },
      },
      take: 10, // Get top 10
    });

    console.log("Top 10 Most Active Workplaces:");
    console.log("================================");

    topWorkplaces.forEach((workplace, index) => {
      const statusText = workplace.status === 0 ? "Active" : 
                        workplace.status === 1 ? "Suspended" : "Closed";
      
      console.log(`${index + 1}. ${workplace.name}`);
      console.log(`   ID: ${workplace.id}`);
      console.log(`   Status: ${statusText}`);
      console.log(`   Total Shifts: ${workplace._count.shifts}`);
      console.log("");
    });

    // Get some additional statistics
    const totalWorkplaces = await prisma.workplace.count();
    const totalShifts = await prisma.shift.count();
    const activeShifts = await prisma.shift.count({
      where: {
        workerId: { not: null },
        cancelledAt: null,
      },
    });

    console.log("Overall Statistics:");
    console.log("===================");
    console.log(`Total Workplaces: ${totalWorkplaces}`);
    console.log(`Total Shifts: ${totalShifts}`);
    console.log(`Active/Claimed Shifts: ${activeShifts}`);
    console.log(`Available Shifts: ${totalShifts - activeShifts}`);

  } catch (error) {
    console.error("Error finding top workplaces:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findTopWorkplaces();
