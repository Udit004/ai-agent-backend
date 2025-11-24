import { runPortfolioChat } from '../ai/services/public.service.js';

export const portfolioChatController = async (req, res) => {
    try {
        const message = req.body.message;
        
        // Add validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required',
                response: 'Please provide a message to chat with me!'
            });
        }

        // Limit message length
        if (message.length > 2000) {
            return res.status(400).json({ 
                error: 'Message too long',
                response: 'Your message is too long. Please keep it under 2000 characters.'
            });
        }
        
        const aiResponse = await runPortfolioChat(message);
        return res.status(200).json({ response: aiResponse });
    } catch (error) {
        console.error('Portfolio chat controller error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            response: "I'm having trouble connecting right now. Please try again later or contact Udit at rajankumart266@gmail.com!"
        });
    }
}