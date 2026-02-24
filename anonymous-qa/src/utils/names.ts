const ADJECTIVES = ['Curious', 'Brave', 'Gentle', 'Swift', 'Wise', 'Happy', 'Silent', 'Mighty', 'Clever', 'Wild'];
const ANIMALS = ['Fox', 'Lion', 'Owl', 'Deer', 'Panda', 'Eagle', 'Wolf', 'Tiger', 'Bear', 'Cat'];

export function getAnonymousIdentity(): string {
  let userId = localStorage.getItem('anon_user_id');
  
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 11);
    localStorage.setItem('anon_user_id', userId);
  }

  // Generate a consistent name from the userId
  const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adjIndex = hash % ADJECTIVES.length;
  const animalIndex = (hash * 3) % ANIMALS.length;
  const number = (hash % 900) + 100;

  return `${ADJECTIVES[adjIndex]} ${ANIMALS[animalIndex]} #${number}`;
}
