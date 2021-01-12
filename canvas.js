//console.log(gsap);
const canvas = document.querySelector('canvas');
// c = context or ctx
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreel')

const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')



// constructor for players
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color 
        c.fill()
    }
}
// creating projectile
class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color 
        c.fill()
    }
    // move projectile
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y 
    }
}

// creating enemy
class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color 
        c.fill()
    }
    // move projectile
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y 
    }
}
// velocity friction slow effect after explosion
const friction = 0.99
// creating enemy
class Particles {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color 
        c.fill()
        c.restore()
    }
    // move projectile
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y 
        this.alpha -= 0.01
    }
}

// center player
const x = canvas.width / 2
const y = canvas.height / 2


let player = new Player(x, y, 15, 'white')
//array of projectiles
let projectiles = []
let enemies = []
let particles = []

// function to reset game
// can't use let more than once because of scope 
function init() {
     player = new Player(x, y, 15, 'white')
    //array of game items
     projectiles = []
     enemies = []
     particles = []
     // set to 0 in backend
     score = 0
     // set to 0 in front end
     scoreEl.innerHTML = score
     bigScoreEl.innerHTML = score
}

// multiple enemy function
function spawnEnemies() {
    setInterval( () => {
        const radius = Math.random() * (30 - 4) + 4

        let x
        let y

        if(Math.random() < 0.5) {
         x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius 
         y = Math.random() * canvas.height
        } else {
         x = Math.random() * canvas.width  
         y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        // opposite direction 
        const angle = Math.atan2(
             canvas.height / 2 - y,
             canvas.width / 2 - x
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity)) 
    }, 1000)
}

// score
// let score = 0
// cancel aniamtion frame
let animationId
let score = 0
// animate function loop 
function animate() {
    animationId = requestAnimationFrame(animate)
    // change color fade effect
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
          particles.splice(index, 1)  
        } else {
            particle.update()
        }

        
    })

    projectiles.forEach((projectile, index) => {
    projectile.update()

        // removing projectile when reach edge of screen
        if (projectile.x +  projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
            ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
        

    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // end game when projectile touches player and show with final score
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

    projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
        
        // objects detection touch remove
        if (dist - enemy.radius - projectile.radius < 1) {

            // create particle explosion
            for (let i = 0; i < enemy.radius * 2; i++) {
                particles.push(
                    new Particles(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    })
                )
                
            }

            if (enemy.radius - 10 > 5) {

                // increase the score
                score += 100;
                scoreEl.innerHTML = score
                console.log(score);

                gsap.to(enemy, {
                    radius: enemy.radius - 10
                })

                setTimeout(()=> {
                    projectiles.splice(projectileIndex, 1)
                }, 0)
            } else {
                // if remove particle entirely increase score
                score += 250;
                scoreEl.innerHTML = score
                setTimeout(()=> {
                    enemies.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                }, 0)
            }
        }
        
        })
    })
    
}

// push new projectiles into array with click event
addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
   projectiles.push(
       new Projectile(canvas.width / 2,
        canvas.height / 2, 5, 'white', velocity)
    )
})

startGameBtn.addEventListener('click', () => {
    // restart game with init()
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})
// animate()
// spawnEnemies() 