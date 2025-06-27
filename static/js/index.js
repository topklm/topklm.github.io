window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  // Skip preloading - images don't exist for TopK LM
  return;
  /*
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
  */
}

function setInterpolationImage(i) {
  // Skip if no interpolation images are loaded
  if (!interp_images || interp_images.length === 0 || !interp_images[i]) {
    console.log('No interpolation image available for index:', i);
    return;
  }
  
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    // Only set up interpolation if the slider exists
    if ($('#interpolation-slider').length > 0) {
      $('#interpolation-slider').on('input', function(event) {
        setInterpolationImage(this.value);
      });
      setInterpolationImage(0);
      $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);
    }

    bulmaSlider.attach();

})

// Extract plain text from BibTeX HTML
function getPlainTextFromBibtex(codeElement) {
  // Create a temporary element to extract text content
  const temp = document.createElement('div');
  temp.innerHTML = codeElement.innerHTML;
  
  // Get text content and preserve existing line breaks
  let text = temp.textContent || temp.innerText || '';
  
  // Clean up the text while preserving intentional formatting
  text = text.trim();
  
  // Normalize whitespace but preserve line breaks
  text = text.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
  text = text.replace(/\n\s*/g, '\n'); // Clean up line breaks
  
  // Ensure proper BibTeX formatting
  text = text.replace(/@(\w+)\s*\{/, '@$1{'); // Fix entry type
  text = text.replace(/,\s*\n\s*/g, ',\n  '); // Fix field separators
  text = text.replace(/=\s*\{/g, ' = {'); // Fix equals spacing
  text = text.replace(/\}\s*,?\s*\n\s*\}/g, '}\n}'); // Fix closing brace
  
  // Ensure each field starts on a new line with proper indentation
  text = text.replace(/,\s*([a-zA-Z_]+)\s*=/g, ',\n  $1 =');
  
  // Fix the opening line
  text = text.replace(/@(\w+)\{([^,\n}]+),?\s*/, '@$1{$2,\n  ');
  
  return text;
}

// Function for copying BibTeX entries
function copyBibtex(containerId) {
  console.log('copyBibtex called with containerId:', containerId);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return;
  }
  
  const button = container.querySelector('.copy-button');
  const copyText = button ? button.querySelector('.copy-text') : null;
  const codeElement = container.querySelector('code');
  
  if (!button || !copyText || !codeElement) {
    console.error('Required elements not found', {button, copyText, codeElement});
    return;
  }
  
  let iconElement = button.querySelector('i');
  console.log('Icon found:', !!iconElement);
  
  const plainText = getPlainTextFromBibtex(codeElement);
  console.log('Copying text:', plainText);
  
  // Function to reset button state
  function resetButton() {
    console.log('Resetting button state');
    button.classList.remove('copied');
    copyText.textContent = 'Copy';
    // Always query for icon when resetting
    const currentIcon = button.querySelector('i');
    if (currentIcon) {
      currentIcon.className = 'fas fa-copy';
    }
  }
  
  // Function to set copied state
  function setCopiedState() {
    console.log('Setting copied state');
    button.classList.add('copied');
    copyText.textContent = 'Copied!';
    // Always query for icon when setting copied state
    const currentIcon = button.querySelector('i');
    if (currentIcon) {
      currentIcon.className = 'fas fa-check';
    }
    
    // Force a layout recalculation to ensure the change is applied
    button.offsetHeight;
    
    // Reset after 2 seconds
    setTimeout(resetButton, 2000);
  }
  
  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(plainText)
      .then(() => {
        console.log('Text copied successfully with modern API');
        setCopiedState();
      })
      .catch(err => {
        console.error('Modern clipboard API failed:', err);
        fallbackCopy();
      });
  } else {
    fallbackCopy();
  }
  
  // Fallback copy method
  function fallbackCopy() {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = plainText;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('Text copied successfully with fallback method');
        setCopiedState();
      } else {
        console.error('Fallback copy command was unsuccessful');
      }
    } catch (fallbackErr) {
      console.error('Fallback copy also failed:', fallbackErr);
    }
  }
}

