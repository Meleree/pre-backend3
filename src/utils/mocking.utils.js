export async function generateMockUsers(num = 1) {
    const bcrypt = await import('bcrypt');
    const password = await bcrypt.default.hash('coder123', 10);
    const users = [];
    for (let i = 0; i < num; i++) {
      users.push({
        first_name: `MockFirst${i}`,
        last_name: `MockLast${i}`,
        email: `mockuser${i}@test.com`,
        password,
        role: i % 2 === 0 ? 'user' : 'admin',
        pets: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return users;
  }
  
  export function generateMockPets(num = 1) {
    const petTypes = ['dog', 'cat', 'parrot', 'hamster'];
    const pets = [];
    for (let i = 0; i < num; i++) {
      pets.push({
        name: `Furry${i}`,
        species: petTypes[i % petTypes.length],
        age: Math.floor(Math.random() * 18) + 1,
        adopted: false,
        owner: null
      });
    }
    return pets;
  }